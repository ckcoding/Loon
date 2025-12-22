/*
[Script]
http-request ^https?:\/\/.* script-path=https://raw.githubusercontent.com/ckcoding/Loon/refs/heads/main/scripts/get_app_info.js, tag=收集流量数据, enabled=true

[MITM]
hostname = *
*/

// ==========================================
// 高性能收集模式：只写缓存，不发网络请求
// 配合 upload_logs.js 定时上传
// ==========================================

const LOG_KEY = "LOON_LOG_BUFFER";
const MAX_BUFFER = 500; // 缓存最大条数，避免占用过多内存

if ($request) {
    let logs = [];
    // 读取现有缓存
    const cached = $persistentStore.read(LOG_KEY);
    if (cached) {
        try {
            logs = JSON.parse(cached);
        } catch (e) {
            logs = [];
        }
    }

    // 只有在缓存未满时写入
    if (logs.length < MAX_BUFFER) {
        logs.push({
            host: $request.headers['Host'] || $request.headers['host'],
            ua: $request.headers['User-Agent'] || $request.headers['user-agent'],
            url: $request.url,
            ts: Date.now()
        });
        $persistentStore.write(JSON.stringify(logs), LOG_KEY);
    }
}

// 立即结束，不阻塞请求
$done({});