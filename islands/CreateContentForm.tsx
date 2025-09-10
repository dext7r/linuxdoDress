/**
 * 内容创作表单 Island
 * 处理客户端表单交互和提交
 */

import { useState } from "preact/hooks";

interface CreateContentFormProps {
  categories: Array<{ id: number; name: string }>;
  userTrustLevel: number;
}

export default function CreateContentForm({ categories, userTrustLevel }: CreateContentFormProps) {
  const [selectedType, setSelectedType] = useState<'original' | 'collected' | 'shared'>('original');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  const handleTypeSelection = (type: 'original' | 'collected' | 'shared') => {
    setSelectedType(type);
    // 更新表单样式
    const cards = document.querySelectorAll('[id^="create-"]');
    cards.forEach(card => {
      card.classList.remove('border-pink-300', 'border-purple-300', 'border-blue-300', 'bg-pink-50', 'bg-purple-50', 'bg-blue-50');
      card.classList.add('border-transparent');
    });
    
    const selectedCard = document.getElementById(`create-${type === 'original' ? 'original' : type === 'collected' ? 'tutorial' : 'share'}`);
    if (selectedCard) {
      const colorClass = type === 'original' ? 'border-pink-300 bg-pink-50' : 
                         type === 'collected' ? 'border-purple-300 bg-purple-50' : 
                         'border-blue-300 bg-blue-50';
      selectedCard.classList.add(...colorClass.split(' '));
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // 获取可见性设置
    const visibilityRadio = form.querySelector('input[name="visibility"]:checked') as HTMLInputElement;
    const minTrustLevel = parseInt(visibilityRadio?.value || '0');

    // 构建提交数据
    const submitData = {
      title: formData.get('title'),
      content: formData.get('content'),
      category_id: formData.get('category'),
      tags: formData.get('tags'),
      min_trust_level: minTrustLevel,
      mature_content: formData.get('mature_content') === 'on',
      post_type: selectedType,
      source_url: selectedType === 'shared' ? formData.get('source_url') : undefined,
    };

    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          content: result.message || '内容提交成功！等待管理员审核后发布。'
        });
        form.reset();
        setSelectedType('original');
        // 重置类型选择的样式
        handleTypeSelection('original');
      } else {
        setSubmitMessage({
          type: 'error',
          content: result.error || '提交失败，请稍后重试。'
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage({
        type: 'error',
        content: '网络错误，请检查连接后重试。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* 提交消息 */}
      {submitMessage && (
        <div className={`mb-6 p-4 rounded-xl ${
          submitMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
            : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <span>{submitMessage.type === 'success' ? '✅' : '❌'}</span>
            <span>{submitMessage.content}</span>
          </div>
        </div>
      )}

      {/* 创作类型选择 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-pink-300 bg-pink-50"
          id="create-original"
          onClick={() => handleTypeSelection('original')}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              原创分享
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              分享您的原创内容、心得体验
            </p>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
          id="create-tutorial"
          onClick={() => handleTypeSelection('collected')}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              教程指南
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              创作详细的教程和指南
            </p>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
          id="create-share"
          onClick={() => handleTypeSelection('shared')}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              链接收藏
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              收藏并分享有趣的链接
            </p>
          </div>
        </div>
      </div>

      {/* 创作表单 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
              placeholder="请输入标题..."
            />
          </div>

          {/* 链接地址 (仅链接收藏类型显示) */}
          {selectedType === 'shared' && (
            <div>
              <label htmlFor="source_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                链接地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="source_url"
                name="source_url"
                required={selectedType === 'shared'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
          )}

          {/* 分类和标签 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分类
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">请选择分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标签
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder="用逗号分隔标签，如：化妆,教程,新手"
              />
            </div>
          </div>

          {/* 可见性设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内容可见性
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="visibility" value="0" className="text-pink-600 focus:ring-pink-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  🌍 公开 - 所有用户可见
                </span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="visibility" value="1" className="text-pink-600 focus:ring-pink-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  👥 基础用户及以上
                </span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="visibility" value="2" className="text-pink-600 focus:ring-pink-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  ⭐ 成员及以上
                </span>
              </label>
              {userTrustLevel >= 3 && (
                <label className="flex items-center">
                  <input type="radio" name="visibility" value="3" className="text-pink-600 focus:ring-pink-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    🌟 常客及以上
                  </span>
                </label>
              )}
              {userTrustLevel >= 4 && (
                <label className="flex items-center">
                  <input type="radio" name="visibility" value="4" className="text-pink-600 focus:ring-pink-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    💎 领导者级别
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* 内容编辑器 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder={
                selectedType === 'shared' 
                  ? "请描述这个链接的内容和推荐理由..."
                  : "在这里写下您想要分享的内容..."
              }
            ></textarea>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              支持 Markdown 格式
            </p>
          </div>

          {/* 内容警告 */}
          <div>
            <label className="flex items-center">
              <input type="checkbox" name="mature_content" className="text-pink-600 focus:ring-pink-500" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                🔞 包含成人内容（需要额外确认才能查看）
              </span>
            </label>
          </div>

          {/* 提交按钮 */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-xl hover:scale-105'
              }`}
            >
              {isSubmitting ? '🔄 提交中...' : '📝 发布内容'}
            </button>
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                const form = document.querySelector('form') as HTMLFormElement;
                form.reset();
                setSelectedType('original');
                handleTypeSelection('original');
                setSubmitMessage(null);
              }}
            >
              🔄 重置表单
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
