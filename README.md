# Alist-on-Glitch

## 概述

本项目用于在 Glitch 免费服务上部署 Alist。

## 注意

 **请勿滥用，账号封禁风险自负。**

 Webdav 功能可能工作不正常。（2024.03.08修复）
 
## 变量

对部署时设定的变量做如下说明。

| 变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `DATABASE_URL` | `` | 数据库连接 URL，默认留空为使用本地 sqlite 数据库 |
| `ARGO_AUTH` | `` | 必填，用于连接 Cloudflare 提供的 Zero Trust Tunnel ，用以绑定域名以及解决 Webdav 挂载问题 |

## 数据持久化

由于免费 Glitch 项目只能是公开项目，强烈建议连接外部 MySQL 或是 PostgreSQL 数据库。

**bit.to 将于 2023.6.29 停止服务**

<details>
<summary><b>  planetscale.com 免费 MySQL 数据库</b></summary>

1. 前往 https://planetscale.com 注册账号，并新建一个数据库。
2. 点击数据库名称，进入数据库管理页面，点击左侧的 Connect，在 "connect with" 下拉菜单中选择 Symfony。
3. 下方 "mysql://" 开头字符串即为数据库连接 URL。密码只会显示一次，如果忘记保存了可以点击 "New password" 重新生成。
</details> 

<details>
<summary><b> elephantsql 免费 PostgreSQL 数据库</b></summary>

1. 前往 https://www.elephantsql.com 注册账号，并新建一个数据库。
2. 点击数据库名称，进入数据库管理页面，右侧的 Details 下方，复制 "URL" 项即为数据库连接 URL。
</details>

## 部署

前往 glitch.com 注册账户，然后点击链接: https://glitch.com/edit/#!/remix/glitch-blank-node

点击左侧文件列表中的 .env 文件，在文件最下方点击 Add a Variable，设置 DATABASE_URL 变量。

![image](https://user-images.githubusercontent.com/98247050/233643773-26ec547a-a1bd-48fe-8302-4a08cf556239.png)

下载[仓库文件](https://github.com/wy580477/Alist-on-Glitch/archive/refs/heads/main.zip)，然后解压缩。

将解压缩得到的除README外的文件，拖动到 glitch 项目页面左侧 Files 处: 

![image](https://user-images.githubusercontent.com/98247050/233638576-15a9d59c-66a1-48f2-92bd-69bd1aaffa08.png)

页面会弹出 overwrite 提示，全部点确定。

稍等片刻即部署完成。

点击左侧文件列表中的 .env 文件，在文件最下方点击 Add a Variable，设置 SITE_URL 变量，值为项目网址，例如 https://apple-prange-fruit.glitch.me

![image](https://user-images.githubusercontent.com/98247050/233753763-8b6de304-73ce-4df3-a9d0-2eb7da2221dd.png)

点击页面下方 LOGS 即可得到初始密码。

点击页面下方 TERMINAL，即可执行 Alist 命令:

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

访问 项目网址/status，查看运行进程。

接着进入 [CLoudflare Dash Board](https://one.dash.cloudflare.com/) ，在 Tunnel 中添加域名，即可使用自己的域名访问 AList ，且此域名可以挂载 Webdav 。

## 通过 Cloudflare 反向代理设置自定义域名

https://github.com/wy580477/PaaS-Related/blob/main/CF_Workers_Reverse_Proxy_chs_simple.md

## 保活

使用任意网站监控程序监控 Glitch 自动分配的域名即可。

## 鸣谢

- [alist-org/alist](https://github.com/alist-org/alist)
- [glitch-trojan](https://github.com/hrzyang/glitch-trojan)
