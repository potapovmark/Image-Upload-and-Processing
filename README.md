## Setup

```bash
npm install
npm run dev
```

## API

- `POST /api/upload/single` - Upload single image
- `POST /api/upload/responsive` - Generate responsive images
- `POST /api/process/:filename` - Process image with options
- `GET /api/metadata/:filename` - Get image metadata
- `POST /api/convert/:filename` - Convert format

## Frontend

Simple HTML interface included at `http://localhost:3000`

## Test

Open `http://localhost:3000` in browser

### Test Commands

```bash
# Health check
curl http://localhost:3000/health

# Upload test
curl -X POST -F "image=@test.jpg" http://localhost:3000/api/upload/single
```
