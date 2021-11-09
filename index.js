import { AwsClient } from 'aws4fetch'

addEventListener('fetch', function(event) {
    event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
    let url = new URL(request.url);
    const privatePath = await get_key("PRIVATE_PATH")
    if (privatePath !== null && new RegExp(privatePath).test(url.pathname)) {
        const token = url.searchParams.get("token")
        if (token === null || !/^(\d{10,11})_([a-f0-9]{64})$/.test(token)) {
            return new Response("Invalid token format", { status: 403 })
        }
        const [expiration, signature] = token.split('_')
        if (Date.now() / 1000 > parseInt(expiration)) {
            return new Response("Token has expired", { status: 410 })
        }
        const key = await crypto.subtle.importKey(
            "raw",
            base64ToArrayBuffer(await get_key("PRIVATE_KEY")),
            { name: "HMAC", hash: "SHA-256"},
            false,
            ["verify"]
        )
        const verified = await crypto.subtle.verify("HMAC", key, hexStringToUint8Array(signature), new TextEncoder().encode(url.pathname + expiration))
        if (!verified) {
            return new Response("Token verifiation failed", { status: 403 })
        }
    }
    const aws = new AwsClient({
        "accessKeyId": await get_key("AWS_ACCESS_KEY_ID"),
        "secretAccessKey": await get_key("AWS_SECRET_ACCESS_KEY"),
    });
    url.hostname = await get_key("AWS_S3_BUCKET") + ".s3." + await get_key("AWS_REGION") + ".amazonaws.com";
    let signedRequest = await aws.sign(url);
    let polish = await get_key("POLISH")
    if (polish === null) {
        polish = "off"
    }
    let cf = { 
        "cacheEverything": true, 
        "minify": {
            "javascript": await get_key("MINIFY_JAVASCRIPT") !== null,
            "css": await get_key("MINIFY_CSS") !== null,
            "html": await get_key("MINIFY_HTML") !== null
        },
        "polish": polish
    }
    return await fetch(signedRequest, { "cf": cf });
}

function hexStringToUint8Array(hexString) {
    let arrayBuffer = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        arrayBuffer[i/2] = parseInt(hexString.substr(i, 2), 16);
    }
    return arrayBuffer;
}

function base64ToArrayBuffer(base64) {
    let binaryString = atob(base64)
    let bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
}

async function get_key(key) {
    let variable = global[key]
    if (typeof variable === 'undefined' || variable === null || variable === "") {
        if (typeof KV === 'undefined') {
            return null
        } else {
            return await KV.get(key)
        }
    } else {
        return variable
    }
}