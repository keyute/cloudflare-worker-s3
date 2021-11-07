# Cloudflare Worker S3

## Wrangler

To generate using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler generate projectname https://github.com/keyute/cloudflare-worker-s3.git
```

## Configure

### KV
Workers KV is the preferred method to access credentials as it supports exceptionally high read volumes and allows high configurability by binding the worker to different KVs based on routes.

These values are required and has no defaults. Any of these values not configured will result in an exception.

| Key | Description |
| --- | --- |
| AWS_ACCESS_KEY_ID | AWS Access Key of user with permission to access your bucket |
| AWS_REGION | AWS region where your bucket is hosted |
| AWS_S3_BUCKET | Name of your bucket |
| AWS_SECRET_ACCESS_KEY | AWS Secret Key of user with permission to access your bucket |
| PRIVATE_KEY (optional) | Your base64 encoded password |
| PRIVATE_REGEX (optional) | Regex of your private file paths for verification |

### Environment
Add these lines to the bottom of [`wrangler.toml`](https://github.com/keyute/cloudflare-worker-s3/blob/main/wrangler.toml) and replace empty values as needed.

```
[env.your_env]
zone_id = ""
route = ""
kv_namespaces = [
    { binding = "KV", id = "" }
]
```

You can add as many environments as you want and publish to these environments respectively.

## Usage

### Verify
Call private files with the parameter ```token``` in your URL with the format ```<timestamp>_<sha256_signature>```

### Generate
Generate a SHA256 signature with the same ```PRIVATE_KEY``` with the format ```<path><timestamp>```

## Publish

To publish using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler publish --env [your_env]
```
