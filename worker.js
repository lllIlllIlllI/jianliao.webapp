export default {
  async fetch(request, env) {
    const apiOrigin = env.API_ORIGIN || "https://api.jianliao.net";
    const wsOrigin = env.WS_ORIGIN || "https://jianliao.relaynet.io";
    // const apiOrigin = env.API_ORIGIN || "https://api.jianliao.net";
    // const wsOrigin = env.WS_ORIGIN || "https://jianliao.relaynet.io";
    const url = new URL(request.url);
    if (url.pathname === "/__worker_ping" || url.pathname === "/__worker__ping") {
      return new Response(
        JSON.stringify({
          ok: true,
          worker: "jianliao-webapp",
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
      return probeUpstream(apiOrigin);
    }

    if (url.pathname.startsWith("/api/")) {
      return proxyApi(request, url, apiOrigin);
    }
    if (url.pathname.startsWith("/im")) {
      return proxyWs(request, url, wsOrigin);
    }

    return env.ASSETS.fetch(request);
  },
};

async function proxyApi(request, url, apiOrigin) {
  const upstreamPath = url.pathname.replace(/^\/api/, "");
  const targetUrl = new URL(upstreamPath + url.search, apiOrigin);
  const headers = new Headers(request.headers);

  headers.set("host", targetUrl.host);
  headers.set("origin", apiOrigin);
  headers.set("referer", `${apiOrigin}/`);

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

async function proxyWs(request, url, wsOrigin) {
  const targetUrl = new URL(url.pathname + url.search, wsOrigin);
  targetUrl.protocol = targetUrl.protocol === "http:" ? "ws:" : "wss:";
  const headers = new Headers(request.headers);
  headers.set("host", targetUrl.host);
  headers.set("origin", wsOrigin);
  headers.set("referer", `${wsOrigin}/`);
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

async function probeUpstream(apiOrigin) {
  const targetUrl = `${apiOrigin}/system/config`;
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
