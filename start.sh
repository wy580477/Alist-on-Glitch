FILES_PATH=${FILES_PATH:-./}
CURRENT_VERSION=''
RELEASE_LATEST=''
CMD="$@"

get_current_version() {
    chmod +x ./app.js 2>/dev/null
    CURRENT_VERSION=$(./app.js version | grep -o v[0-9]*\.*.)
}

get_latest_version() {
    # Get latest release version number
    RELEASE_LATEST="$(curl -IkLs -o ${TMP_DIRECTORY}/NUL -w %{url_effective} https://github.com/alist-org/alist/releases/latest | grep -o "[^/]*$")"
    RELEASE_LATEST="v${RELEASE_LATEST#v}"
    if [[ -z "$RELEASE_LATEST" ]]; then
        echo "error: Failed to get the latest release version, please check your network."
        exit 1
    fi
}

download_web() {
    DOWNLOAD_LINK="https://github.com/alist-org/alist/releases/latest/download/alist-linux-musl-amd64.tar.gz"
    if ! wget -qO "$ZIP_FILE" "$DOWNLOAD_LINK"; then
        echo 'error: Download failed! Please check your network or try again.'
        return 1
    fi
    return 0
}

decompression() {
    tar -zxf "$1" -C "$TMP_DIRECTORY"
    EXIT_CODE=$?
    if [ ${EXIT_CODE} -ne 0 ]; then
        "rm" -r "$TMP_DIRECTORY"
        echo "removed: $TMP_DIRECTORY"
        exit 1
    fi
}

install_web() {
    install -m 755 ${TMP_DIRECTORY}/alist ${FILES_PATH}/app.js
}

PARSE_DB_URL() {
    # extract the protocol
    proto="$(echo $DATABASE_URL | grep '://' | sed -e's,^\(.*://\).*,\1,g')"
    if [[ "${proto}" =~ postgres ]]; then
        export DB_TYPE=postgres
        export DB_SSL_MODE=require
    elif [[ "${proto}" =~ mysql ]]; then
        export DB_TYPE=mysql
        export DB_SSL_MODE=true
    fi

    # remove the protocol
    url=$(echo $DATABASE_URL | sed -e s,${proto},,g)

    # extract the user and password (if any)
    userpass="$(echo $url | grep @ | cut -d@ -f1)"
    export DB_PASS=$(echo $userpass | grep : | cut -d: -f2)
    if [ -n "$DB_PASS" ]; then
        export DB_USER=$(echo $userpass | grep : | cut -d: -f1)
    else
        export DB_USER=$userpass
    fi

    # extract the host -- updated
    hostport=$(echo $url | sed -e s,$userpass@,,g | cut -d/ -f1)
    export DB_PORT=$(echo $hostport | grep : | cut -d: -f2)
    if [ -n "$DB_PORT" ]; then
        export DB_HOST=$(echo $hostport | grep : | cut -d: -f1)
    else
        export DB_HOST=$hostport
    fi
    if [[ ${DB_TYPE} = postgres ]] && [[ ${DB_PORT} = "" ]]; then
        export DB_PORT=5432
    fi

    # extract the name (if any)
    export DB_NAME="$(echo $url | grep / | cut -d/ -f2- | sed 's|?.*||')"
}

run_web() {
    if [ "$CMD" = "server" ]; then   
        killall app.js 2>/dev/null
    fi

    if [ "${DATABASE_URL}" != "" ]; then
        PARSE_DB_URL
    fi

    export HTTP_PORT=5244
    export LOG_ENABLE=false
    export TEMP_DIR=/tmp/web
    chmod +x ./app.js
    exec ./app.js $CMD --no-prefix 2>&1 &
}

TMP_DIRECTORY="$(mktemp -d)"
ZIP_FILE="${TMP_DIRECTORY}/alist-linux-musl-amd64.tar.gz"

get_current_version
get_latest_version
if [ "${RELEASE_LATEST}" = "${CURRENT_VERSION}" ]; then
    "rm" -rf "$TMP_DIRECTORY"
    run_web
    exit
fi
download_web
EXIT_CODE=$?
if [ ${EXIT_CODE} -eq 0 ]; then
    :
else
    "rm" -r "$TMP_DIRECTORY"
    run_web
    exit
fi
decompression "$ZIP_FILE"
install_web
"rm" -rf "$TMP_DIRECTORY"
run_web
