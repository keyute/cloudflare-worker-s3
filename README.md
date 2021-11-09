# Cloudflare Worker S3
Keep your S3 bucket private without any compromise within the free [limit](https://developers.cloudflare.com/workers/platform/limits).

## Wrangler

To generate using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler generate projectname https://github.com/keyute/cloudflare-worker-s3.git
```

## Configure

### Methods

#### Environment Variables (Recommended)
Recommended for single worker deployment or projects with untrusted access to KV. Remove variables defined as secrets from ```vars``` appropriately to avoid conflicts.

#### KV
Workers KV supports exceptionally high read volumes and allows configuration of multiple workers by binding workers to the same KV.

#### Using Both
This cloudflare worker supports using KV, secrets and environment variables. It will first look for secrets and environment variables before looking up KV. Remove any environment variables if you plan to define them in KV.

### Environment
Add these lines to the bottom of [`wrangler.toml`](https://github.com/keyute/cloudflare-worker-s3/blob/master/wrangler.toml) and replace empty values as needed.

```
[env.your_env]
zone_id = ""
route = ""
vars = { "AWS_ACCESS_KEY_ID" = "", "AWS_REGION" = "", "AWS_S3_BUCKET" = "", "AWS_SECRET_ACCESS_KEY" = "" }
# secrets = ["AWS_ACCESS_KEY_ID", "AWS_REGION", "AWS_S3_BUCKET", "AWS_SECRET_ACCESS_KEY"]
# kv_namespaces = [
#     { binding = "KV", id = "" }
# ]
```

These values are required and has no defaults. Any of these values not configured will result in an exception.

| Key | Description |
| --- | --- |
| AWS_ACCESS_KEY_ID | AWS Access Key of user with permission to access your bucket |
| AWS_REGION | AWS region where your bucket is hosted |
| AWS_S3_BUCKET | Name of your bucket |
| AWS_SECRET_ACCESS_KEY | AWS Secret Key of user with permission to access your bucket |
| PRIVATE_KEY (optional) | Your base64 encoded password |
| PRIVATE_REGEX (optional) | Regex of your private file paths for verification |
| MINIFY_JAVASCRIPT (optional) | Minifies response if javascript. Set any value to be ```true``` |
| MINIFY_CSS (optional) | Minifies response if css. Set any value to be ```true``` |
| MINIFY_HTML (optional) | Minifies response if html. Set any value to be ```true``` |
| POLISH (optional) | Enable [polish](https://blog.cloudflare.com/introducing-polish-automatic-image-optimizati/). Accepted values are ```lossy```, ```lossless``` or ```off``` |

You can add as many environments as you want and publish to these environments respectively.

## Private Files
This cloudflare worker supports signature validation for files that has an expiry date. 

### Verify
Call private files with the parameter ```token``` in your URL with the format ```<timestamp>_<sha256_signature>```

### Generate
Generate a SHA256 signature with the same ```PRIVATE_KEY``` and the format ```<path><timestamp>```

## Publish

To publish using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler publish --env [your_env]
```
