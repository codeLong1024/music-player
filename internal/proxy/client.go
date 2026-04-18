package proxy

import (
	"time"

	"github.com/go-resty/resty/v2"
)

// HTTPClient 封装的 HTTP 客户端
type HTTPClient struct {
	client *resty.Client
}

// NewHTTPClient 创建新的 HTTP 客户端
func NewHTTPClient() *HTTPClient {
	client := resty.New()

	// 设置默认请求头
	client.SetHeaders(map[string]string{
		"User-Agent":                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		"Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
		"Accept-Language":           "zh-CN,zh;q=0.9,en;q=0.8",
		"Accept-Encoding":           "gzip, deflate, br",
		"Connection":                "keep-alive",
		"Upgrade-Insecure-Requests": "1",
	})

	// 设置超时
	client.SetTimeout(15 * time.Second)

	// 设置重试机制
	client.SetRetryCount(2)
	client.SetRetryWaitTime(1 * time.Second)
	client.SetRetryMaxWaitTime(5 * time.Second)

	return &HTTPClient{
		client: client,
	}
}

// Get 发送 GET 请求
func (c *HTTPClient) Get(url string) (*resty.Response, error) {
	return c.client.R().Get(url)
}

// Post 发送 POST 请求
func (c *HTTPClient) Post(url string, data map[string]string) (*resty.Response, error) {
	return c.client.R().
		SetFormData(data).
		SetHeader("Content-Type", "application/x-www-form-urlencoded").
		SetHeader("X-Requested-With", "XMLHttpRequest").
		Post(url)
}

// GetClient 获取原始客户端（用于高级用法）
func (c *HTTPClient) GetClient() *resty.Client {
	return c.client
}
