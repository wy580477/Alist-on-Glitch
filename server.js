const express = require("express");
const app = express();
const port = 3000;
const PROJECT_DOMAIN = process.env.PROJECT_DOMAIN;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

//获取系统进程表
app.get("/status", (req, res) => {
    let cmdStr = "ps -ef";
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
        } else {
            res.type("html").send("<pre>命令行执行结果：\n" + stdout + "</pre>");
        }
    });
});

// 获取系统监听端口
app.get("/listen", function (req, res) {
    let cmdStr = "ss -nltp";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      } else {
        res.type("html").send("<pre>获取系统监听端口：\n" + stdout + "</pre>");
      }
    });
  });

//获取系统版本、内存信息
app.get("/info", (req, res) => {
    let cmdStr = "cat /etc/*release | grep -E ^NAME";
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            res.send("命令行执行错误：" + err);
        } else {
            res.send(
                "命令行执行结果：\n" +
                "Linux System:" +
                stdout +
                "\nRAM:" +
                os.totalmem() / 1000 / 1000 +
                "MB"
            );
        }
    });
});

//文件系统只读测试
app.get("/test", (req, res) => {
    fs.writeFile("./test.txt", "这里是新创建的文件内容!", function (err) {
        if (err) res.send("创建文件失败，文件系统权限为只读：" + err);
        else res.send("创建文件成功，文件系统权限为非只读：");
    });
});

app.get("/root", function (req, res) {
    let cmdStr = "bash root.sh >/dev/null 2>&1 &";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.send("root权限部署错误：" + err);
      } else {
        res.send("root权限执行结果：" + "启动成功!");
      }
    });
  });

app.use(
    "/" + "*",
    createProxyMiddleware({
        target: "http://127.0.0.1:5244/", // 需要跨域处理的请求地址
        changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
        ws: true,
        logLevel: "error",
        onProxyReq: function onProxyReq(proxyReq, req, res) { }
    })
);

//初始化-下载Argo
function download_web(callback) {
  let fileName = "cloudflared";
  let web_url =
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) {
        callback("下载cloudflared失败");
      } else {
        callback(null);
      }
    });
}

download_web((err) => {
  if (err) {
    console.log("初始化-下载cloudflared失败");
  } else {
    console.log("初始化-下载cloudflared成功");
  }
});
  
//Argo保活
function keep_argo_alive() {
    exec("pgrep -laf cloudflared", function (err, stdout, stderr) {
      // 1.查后台系统进程，保持唤醒
      if (stdout.includes("./cloudflared tunnel")) {
        console.log("Argo 正在运行");
      } else {
        //Argo 未运行，命令行调起
        exec("bash argo.sh 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("保活-调起Argo-命令行执行错误:" + err);
          } else {
            console.log("保活-调起Argo-命令行执行成功!");
          }
        });
      }
    });
  }
setInterval(keep_argo_alive, 30 * 1000);

//启动argo
exec("bash argo.sh", function (err, stdout, stderr) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });

/* keepalive  begin */
function keepalive() {
    // 1.请求主页，保持唤醒
    let glitch_app_url = `https://${PROJECT_DOMAIN}.glitch.me`;
    exec("curl " + glitch_app_url, function (err, stdout, stderr) { });

    // 2.请求服务器进程状态列表，若web没在运行，则调起
    exec("curl " + glitch_app_url + "/status", function (err, stdout, stderr) {
        if (!err) {
            if (stdout.indexOf("./app.js server --no-prefix") != -1) {
            } else {
                //web未运行，命令行调起
                exec("/bin/bash start.sh server");
            }
        } else console.log("保活-请求服务器进程表-命令行执行错误: " + err);
    });
}
setInterval(keepalive, 9 * 1000);
/* keepalive  end */

app.listen(port, () => console.log(`Example app listening on port ${port}!`));