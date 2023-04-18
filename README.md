# SERDP Fish and Fire web app

## Setup

### Run the app

```
nvm use lts/hydrogen
npm install
npm run dev
```

### Build and upload the app to S3

```
nvm use lts/hydrogen
npm run build
aws s3 cp .output/public s3://fish-and-fire-test/ --acl public-read --recursive
```
