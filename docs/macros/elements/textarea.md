# Hướng dẫn sử dụng macro `textarea` trong Nunjucks

Đây là hướng dẫn cách sử dụng macro `textarea` được import từ file `macros/textarea.njk`.

## Import macro

```nunjucks
{% import "macros/textarea.njk" as textarea %}
```

## Cách sử dụng

### 1. Sử dụng mặc định

Tạo một thẻ `<textarea>` với các thiết lập mặc định:

```nunjucks
{{ textarea.textarea() }}
```

### 2. Sử dụng với các tham số tùy chỉnh

Tạo một thẻ `<textarea>` với ID, số cột, số hàng và placeholder tùy chỉnh:

```nunjucks
{{ textarea.textarea(id='customEditor', cols=100, rows=15, placeholder='Nhập văn bản ở đây') }}
```

## Tham số hỗ trợ

| Tham số       | Mô tả                              | Giá trị mặc định |
|---------------|-------------------------------------|------------------|
| `id`          | ID của textarea                     | `editor`         |
| `cols`        | Số cột (chiều rộng) của textarea    | `80`             |
| `rows`        | Số hàng (chiều cao) của textarea    | `10`             |
| `placeholder` | Văn bản gợi ý khi textarea trống    | `""`             |

---

> **Lưu ý:** File macro `macros/textarea.njk` cần được định nghĩa với logic hỗ trợ các tham số trên để hoạt động đúng.
