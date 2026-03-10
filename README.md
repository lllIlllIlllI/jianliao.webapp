








## 安装依赖
```
npm install
```
为了支持打包桌面端，在3.7版本开始引入了electron, 但是实践中发现，下载electron依赖经常会失败,可以尝试以下方法:
1. 多尝试npm install几次
2. 使用淘宝仓库镜像源
3. vpn翻墙
4. 如果不需要桌面端，可以把package.json里面的electron相关的依赖移除

### 本地启动web端
```
npm run serve
```

### 打包web端
```
npm run build
```

### 本地启动electron
```
npm run electron:serve
```

### 打包electron(windows exe)
```
npm run electron:build
```
构建electron客户端需保证以下几点:
1.目录不能有中文，否则会报错
2.图标(public/logo.ico)大小必须为256x256


### 打包electron (macOS)
```
npm run electron:build-mac
```
