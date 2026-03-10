const API_ORIGIN = "https://qq.jianliao.net";
const WS_ORIGIN = "https://jianliao.relaynet.io";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/__worker_ping" || url.pathname === "/__worker__ping") {
      return new Response(
        JSON.stringify({
          ok: true,
          worker: "jianliaowebapp2",
          version: "2026-03-08-1",
          now: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        }
      );
    }
    if (url.pathname === "/__upstream_ping" || url.pathname === "/__upstream__ping") {
      return probeUpstream();
    }

    if (url.pathname.startsWith("/api/")) {
      return proxyApi(request, url);
    }
    if (url.pathname.startsWith("/im")) {
      return proxyWs(request, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function proxyApi(request, url) {
  const targetUrl = new URL(url.pathname + url.search, API_ORIGIN);
  const headers = new Headers(request.headers);

  headers.set("host", targetUrl.host);
  headers.set("origin", API_ORIGIN);
  headers.set("referer", `${API_ORIGIN}/`);

  const proxyRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });

  try {
    const upstreamRes = await fetch(proxyRequest);
    if (upstreamRes.status >= 500) {
      return jsonError(502, "UPSTREAM_API_BAD_STATUS", {
        upstreamStatus: upstreamRes.status,
        upstream: targetUrl.toString(),
        cfRay: upstreamRes.headers.get("cf-ray") || "",
      });
    }
    return upstreamRes;
  } catch (error) {
    return jsonError(502, "UPSTREAM_API_FETCH_FAILED", {
      message: error && error.message ? error.message : String(error),
      upstream: targetUrl.toString(),
      method: request.method,
    });
  }
}

async function proxyWs(request, url) {
  const targetUrl = new URL(url.pathname + url.search, WS_ORIGIN);
  targetUrl.protocol = targetUrl.protocol === "http:" ? "ws:" : "wss:";
  const headers = new Headers(request.headers);
  headers.set("host", targetUrl.host);
  headers.set("origin", WS_ORIGIN);
  headers.set("referer", `${WS_ORIGIN}/`);
  const proxyRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });
  try {
    return await fetch(proxyRequest);
  } catch (error) {
    return jsonError(502, "UPSTREAM_WS_FETCH_FAILED", {
      message: error && error.message ? error.message : String(error),
      upstream: targetUrl.toString(),
      method: request.method,
    });
  }
}

function jsonError(status, code, details) {
  return new Response(
    JSON.stringify({
      ok: false,
      code,
      details,
    }),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    }
  );
}

async function probeUpstream() {
  const targetUrl = `${API_ORIGIN}/api/system/config`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("probe-timeout"), 3000);
    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return new Response(
      JSON.stringify({
        ok: res.ok,
        status: res.status,
        url: targetUrl,
        cfRay: res.headers.get("cf-ray") || "",
        server: res.headers.get("server") || "",
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      }
    );
  } catch (error) {
    return jsonError(502, "UPSTREAM_PROBE_FAILED", {
      message: error && error.message ? error.message : String(error),
      url: targetUrl,
    });
  }
}
