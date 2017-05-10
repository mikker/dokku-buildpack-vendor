# dokku-buildpack-vendor

`heroku-buildpack-ruby` fetches bundler, yaml and ruby (twice!) from S3 every time you deploy. This is slow and it makes me sad to wait. Luckily it allows a `BUILDPACK_VENDOR_URL`. This project can be your vendor url.

### Usage

Clone and deploy this project somewhere then in your own project:

```sh
dokku config:set my-app --no-restart BUILDPACK_VENDOR_URL=https://url.to.this.project/heroku-buildpack-ruby
```

That's it! Now just deploy like you would normally.

### How?

First time the vendor is asked for a `tgz` it fetches it from S3 and 1) sends it back to the deployment right away but also 2) saves a copy to `/tmp`.

Next time it's asked, it sends directly from the cached copy.

### License

MIT
