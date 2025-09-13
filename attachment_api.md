## Attachment API – Bugs and Comments

**Auth**: Bearer token required  
**Upload field**: `attachment` (multipart/form-data)  
**Max size**: 10 MB  
**Storage**: Uploaded to S3; responses return time-limited signed URLs  
**Access**: You must have access to the bug/report; comment attachment access is checked via the parent bug

### Draft Attachments (for Markdown Content)

For scenarios where you need to upload attachments before creating a bug (e.g., when using markdown content with images), you can use draft attachments.

#### Upload Draft Attachment
- **Endpoint**: `POST /api/v2/attachments/draft`
- **Body**: multipart/form-data, file field `attachment`
- **Allowed types**: Same as bug attachments (see below)
- **Response 201**:
  - `success: true`
  - `data`: `id, image_url, filename, size, type, created_at, is_draft: true`

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/attachments/draft" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "attachment=@/path/to/screenshot.png"
```

#### Link Draft Attachments to Bug
When creating a bug, include the `attachment_ids` array to link previously uploaded draft attachments:

```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/reports/123/bugs" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "XSS Vulnerability",
    "domain": "example.com",
    "description": "Found XSS with ![screenshot](attachment:456)",
    "poc": "Steps to reproduce...",
    "fix": "Input validation needed",
    "type": 1,
    "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    "attachment_ids": [456, 457]
  }'
```

#### Cleanup Orphaned Drafts
- **Endpoint**: `POST /api/v2/attachments/cleanup` (Superadmin only)
- **Purpose**: Removes draft attachments older than 24 hours
- **Response 200**: `success: true, message: "Cleaned up X orphaned draft attachments"`

### Bug attachments

#### Create
- **Endpoint**: `POST /api/v2/bugs/{bug_id}/attachments`
- **Body**: multipart/form-data, file field `attachment`
- **Allowed types**:
  - Images: `png, jpg, jpeg, gif, bmp, webp`
  - Documents: `pdf, txt, doc, docx, xls, xlsx, ppt, pptx`
  - Videos: `mp4, avi, mov, wmv, flv, webm`
  - Archives: `zip, rar, 7z, tar, gz`
- **Response 201**:
  - `success: true`
  - `data`: `id, image_url, filename, size, type, created_at`

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/bugs/123/attachments" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "attachment=@/path/to/file.pdf"
```

#### Delete
- **Endpoint**: `DELETE /api/v2/bugs/{bug_id}/attachments/{attachment_id}`
- **Response 200**:
  - `success: true`
  - `message`: confirmation of deletion (S3 deletion attempted and soft delete in DB)

Example:
```bash
curl -X DELETE "https://demoapi.whyxpose.com/api/v2/bugs/123/attachments/456" \
  -H "Authorization: Bearer <TOKEN>"
```

### Comment attachments

#### Upload Draft Attachment for Comments
- **Endpoint**: `POST /api/v2/comments/attachments/draft`
- **Body**: multipart/form-data, file field `attachment`
- **Allowed types**: `png, jpg, jpeg, gif, mp4, avi, mov, pdf, txt, doc, docx, xls, xlsx, ppt, pptx, zip, rar`
- **Blocked types (security)**: `html, htm, svg, php, js, exe, bat, cmd, sh, ps1, vbs, jar, war, ear`
- **Response 201**:
  - `success: true`
  - `data`: `id, image_url, filename, size, type, created_at, is_draft: true`

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/comments/attachments/draft" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "attachment=@/path/to/screenshot.png"
```

#### Link Draft Attachments to Comment
When creating a comment, include the `attachment_ids` array to link previously uploaded draft attachments:

```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/bugs/123/comments" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Here is the screenshot showing the issue: ![screenshot](attachment:456)",
    "attachment_ids": [456, 457]
  }'
```

#### Create (Regular)
- **Endpoint**: `POST /api/v2/comments/{comment_id}/attachments`
- **Body**: multipart/form-data, file field `attachment`
- **Allowed types**: `png, jpg, jpeg, gif, mp4, avi, mov, pdf, txt, doc, docx, xls, xlsx, ppt, pptx, zip, rar`
- **Blocked types (security)**: `html, htm, svg, php, js, exe, bat, cmd, sh, ps1, vbs, jar, war, ear`
- **Response 201**:
  - `success: true`
  - `data`: `id, image_url, filename, size, type, created_at`

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/comments/789/attachments" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "attachment=@/path/to/screenshot.png"
```

#### Delete
- **Endpoint**: `DELETE /api/v2/comments/{comment_id}/attachments/{attachment_id}`
- **Response 200**:
  - `success: true`
  - `message`: confirmation (DB delete; S3 delete attempted when URL is on S3)

Example:
```bash
curl -X DELETE "https://demoapi.whyxpose.com/api/v2/comments/789/attachments/456" \
  -H "Authorization: Bearer <TOKEN>"
```

### Permission Controls

#### Bug Attachments
- **Upload/Delete**: Anyone with access to the bug (via report access) can upload/delete attachments
- **View**: Anyone with access to the bug can view attachments

#### Comment Attachments  
- **Upload/Delete**: Only the comment creator can upload/delete attachments to their own comments
- **View**: Anyone with access to the bug can view comment attachments
- **Edit Comment**: Only the comment creator can edit their own comments (including system-generated comments cannot be edited)

#### Draft Attachments
- **Upload**: Any authenticated user can upload draft attachments
- **Link**: Only the user who uploaded the draft attachments can link them to bugs/comments
- **Cleanup**: Only superadmin can run cleanup of orphaned draft attachments

### Notes
- `image_url` in responses is a presigned S3 URL and will expire.
- Some read endpoints may re-sign S3 URLs on the fly.
- You can provide `X-Company-ID` to scope to a specific company (must be authorized for that company).
- Draft attachments are automatically cleaned up after 24 hours if not linked to a bug or comment.



