/**
 * 帖子输入表单 Island 组件
 */

import { useState, useEffect } from "preact/hooks";
import Button from "../components/ui/Button.tsx";
import Input from "../components/ui/Input.tsx";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card.tsx";

export default function PostForm() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState("");
  const [isCollecting, setIsCollecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    globalThis.location.href = "/api/auth/linuxdo";
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsCollecting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/posts/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setUrl("");
      } else {
        setError(data.message || "采集失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setIsCollecting(false);
    }
  };

  // 未登录用户显示登录提示
  if (!isAuthenticated) {
    return (
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-pink-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📝</span>
            添加新帖子
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              请先登录 Linux.do 账号才能添加帖子
            </p>
            <Button 
              onClick={handleLogin}
              variant="primary"
            >
              登录后添加帖子
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📝</span>
          添加新帖子
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          输入 Linux.do 帖子链接，系统将自动采集帖子信息
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="请输入 Linux.do 帖子链接，如：https://linux.do/t/topic/12345"
              value={url}
              onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
              disabled={isCollecting}
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              支持的链接格式：https://linux.do/t/topic-name/topic-id
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={isCollecting}
              disabled={!url.trim() || isCollecting}
              variant="primary"
              className="flex-1 sm:flex-none"
            >
              {isCollecting ? "采集中..." : "开始采集"}
            </Button>
            
            {url && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUrl("");
                  setError("");
                  setResult(null);
                }}
              >
                清空
              </Button>
            )}
          </div>
        </form>

        {/* 错误信息 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <span>⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 采集结果预览 */}
        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-3">
              <span>✅</span>
              <span className="font-medium">采集成功！</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">标题：</span>
                <span className="text-gray-600 dark:text-gray-400">{result.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">作者：</span>
                <span className="text-gray-600 dark:text-gray-400">{result.author.username}</span>
              </div>
              {result.images.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">图片数量：</span>
                  <span className="text-gray-600 dark:text-gray-400">{result.images.length} 张</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400">
                帖子信息已采集完成，管理员审核通过后将在列表中显示
              </p>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div className="font-medium mb-2">📋 使用说明：</div>
            <div>• 只支持 Linux.do 论坛的帖子链接</div>
            <div>• 系统会自动提取标题、作者、内容和图片</div>
            <div>• 采集的内容需要管理员审核后才会公开显示</div>
            <div>• 请确保分享的内容符合社区规范</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}