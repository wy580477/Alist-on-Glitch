# Alist-on-Glitch

## 概述

本项目用于在 Glitch 免费服务上部署 Alist。

教程具有时效性，部分选项可能不同，请自行判断。

## 注意

 **请勿滥用，账号封禁风险自负。**

 Webdav 功能可能工作不正常。
 

## 数据库部署

由于免费 Glitch 项目只能是公开项目，强烈建议连接外部 MySQL 或是 PostgreSQL 数据库。

本教程使用 `Planetscale` 的免费 `MySQL` 数据库

1. 前往 [Planetscale注册界面](https://auth.planetscale.com/sign-up) 注册。完成显示`Please verify your email`时检查您的邮件信箱，然后刷新您的页面
2. 进入`overview`界面，点击`create a new database`。第一行输入你想要的数据库名称，第二行承载服务器：随意选择
3. 第三行选择plan，请选择`hobby`免费服务。完成后划到最底下，出现`Please add a credit or debit card to this organization`验证银行卡，请选择一张`visa`或者是`master card`。本人实测并不会扣款验证
4. 完成绑卡选项后，请确认右下角`Total monthly cost`显示的是Free。后点击`create database`
5. `select your language or framework`页面，请选择`MySQL CLI`。完成后往下滑点击`create password` 出现账号密码。在这时，请保存password。
6. 至此创建数据库完成
7. 回到`overview`页面。点击你创建的数据库，进入数据库管理页面，点击右侧的 `Connect`，在 "connect with" 下拉菜单中选择 `Symfony`。
请保存本文本，后面要使用的。

## glitch部署

前往 [glitch](https://glitch.com) 注册账户，然后点击链接: [glitch-blank-node](https://glitch.com/edit/#!/remix/glitch-blank-node)  


左侧面板文件：删除除.env外所有文件。完成后点击文件列表中的 .env 文件，在文件最下方点击 `Add a Variable`，设置变量。

## 变量
`DATABASE_URL='mysql://#username:#password*@#sql地址:#端口/#容器名称?serverVersion=#版本'`

对部署时设定的变量做如下说明。

| 变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `DB_HOST` | #sql地址 | 数据库主机名 |
| `DB_NAME` | #容器名称 | 数据库名称 |
| `DB_PASS` | #password | 数据库密码 |
| `DB_USER` | #username | 数据库用户名 |
| `DB_PORT` | #端口 | 数据库端口 |
| `DB_TYPE` | mysql | 数据库类型 |
| `DB_SSL_MODE` | PREFERRED | 数据库 SSL 模式 |
| `DB_TABLE_PREFIX` | x_ | 数据表前缀 |


完成后下载[仓库文件](https://github.com/wy580477/Alist-on-Glitch/archive/refs/heads/main.zip)，然后解压缩。

将解压缩得到的除README外的文件，拖动到 glitch 项目页面左侧 Files 处: 

![image](https://user-images.githubusercontent.com/98247050/233638576-15a9d59c-66a1-48f2-92bd-69bd1aaffa08.png)

页面会弹出 `overwrite` 提示，全部点确定。

稍等片刻即部署完成。

点击左侧文件列表中的 .env 文件，在文件最下方点击 `Add a Variable`，设置 `SITE_URL` 变量，值为项目网址，例如 `https://apple-prange-fruit.glitch.me
`
![image](https://user-images.githubusercontent.com/98247050/233753763-8b6de304-73ce-4df3-a9d0-2eb7da2221dd.png)

点击页面下方 `LOGS` 即可得到初始密码。

点击页面下方 [TERMINAL]()，即可执行 Alist 命令:

```
# 随机生成管理员密码
bash start.sh admin random

# 手动设置管理员密码,`NEW_PASSWORD`是指你需要设置的密码
bash start.sh admin set NEW_PASSWORD

# 重启 Alist
bash start.sh server

# 查看 Alist 版本
bash start.sh version
```

访问 项目网址/status，可以查看运行进程。

## 通过 Cloudflare 反向代理设置自定义域名

### 前提：你必须要在Cloudflare持有域名！！

1. 打开主面板，左侧选择`workers 和 pages`。右上角选择`创建应用程序`点击`创建worker`。名称随意，点击部署
2. 完成后点击`编辑代码`。粘贴以下代码

```
const host = 'https://apple-prange-fruit.glitch.me'; // 将此行替换为您的Glitch自定义域名

addEventListener(
  "fetch",event => { 

      let url=new URL(event.request.url);
      url.hostname=host;
      let request=new Request(url,event.request);
      event. respondWith(
          fetch(request)
      )
  }
)
```
3. 点击`保存并部署`
4. 点击`触发器`，点击`添加自定义域名`。输入您的自定义域名，下方选择你刚创建的`workers项目`，完成反代。

## 鸣谢

- [alist-org/alist](https://github.com/alist-org/alist)
- [glitch-trojan](https://github.com/hrzyang/glitch-trojan)
- [Alist-on-Glitch](https://github.com/wy580477/Alist-on-Glitch)
```
