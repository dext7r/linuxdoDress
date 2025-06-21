import { JSX } from "preact";
import { useEffect } from "preact/hooks";
import { createPortal } from "preact/compat";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: JSX.Element | JSX.Element[] | string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  useEffect(() => {
    if (!isOpen) return;

    // 禁用背景滚动
    document.body.style.overflow = "hidden";

    // ESC键关闭
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    if (closeOnEscape) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      if (closeOnEscape) {
        document.removeEventListener("keydown", handleEscape);
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content w-full ${sizeClasses[size]} mx-4`}>
        {/* 头部 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="关闭"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 内容 */}
        <div className="text-gray-600 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );

  // 使用Portal渲染到body
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

// Modal子组件
interface ModalHeaderProps {
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

export const ModalHeader = ({ children, className = "" }: ModalHeaderProps) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

interface ModalBodyProps {
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

export const ModalBody = ({ children, className = "" }: ModalBodyProps) => (
  <div className={`mb-6 ${className}`}>
    {children}
  </div>
);

interface ModalFooterProps {
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

export const ModalFooter = ({ children, className = "" }: ModalFooterProps) => (
  <div
    className={`flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

export default Modal;
