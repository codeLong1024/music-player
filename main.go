package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/**
var assets embed.FS

func main() {
	// 创建应用实例
	app := NewApp()

	// 创建 Wails 应用
	err := wails.Run(&options.App{
		Title:     app.cfg.AppName,
		Width:     1024,
		Height:    650,
		MinWidth:  800,
		MinHeight: 600,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 26, G: 11, B: 46, A: 1},
		OnStartup:        app.startup,
		OnDomReady:       app.domReady,
		OnShutdown:       app.shutdown,
		Frameless:        false, // 启用窗口标题栏和控制按钮
	})

	if err != nil {
		log.Fatal(err)
	}
}
