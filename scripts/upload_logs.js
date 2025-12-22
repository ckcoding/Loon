/*
 * 定时上传日志脚本
 * 功能：读取本地 persistentStore 中的缓存日志，批量发送到服务器
 * 建议配置 Cron：0/1 * * * * (每分钟尝试上传一次)
 */

const API_URL = "http://8.220.241.231:3000/loon/log";
const LOG_KEY = "LOON_LOG_BUFFER";

try {
    const str = $persistentStore.read(LOG_KEY);
    if (!str || str === "[]") {
        console.log("📭 没有日志需要上传");
        $done({});
    } else {
        const logs = JSON.parse(str);
        if (!Array.isArray(logs) || logs.length === 0) {
            $done({});
            return;
        }

        console.log(`📤 准备上传 ${logs.length} 条日志...`);

        $httpClient.post({
            url: API_URL,
            headers: { "Content-Type": "application/json" },
            body: str // 直接发送 JSON 字符串
        }, (error, response, data) => {
            if (error) {
                console.log("❌ 上传失败: " + error);
            } else {
                console.log(`✅ 上传成功 (${logs.length} 条)`);
                // 上传成功后清空缓存
                $persistentStore.write("[]", LOG_KEY);
            }
            $done({});
        });
    }
} catch (e) {
    console.log("❌ 脚本错误: " + e.message);
    $done({});
}
