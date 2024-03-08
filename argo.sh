# 赋权并启动Argo
run_argo() {
chmod +x cloudflared && nohup ./cloudflared tunnel --edge-ip-version auto --protocol http2 run --token ${ARGO_AUTH} 2>/dev/null 2>&1 &
}

run_argo