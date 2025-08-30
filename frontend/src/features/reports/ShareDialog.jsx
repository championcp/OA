import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useGenerateShareMutation, useGetShareLinksQuery, useRevokeShareMutation } from '../../services/reportApi';
import { ClipboardDocumentIcon, TrashIcon } from '@heroicons/react/24/outline';

const ShareDialog = ({ reportId, isOpen, onClose }) => {
  const [expiryDays, setExpiryDays] = useState(7);
  const [permissions, setPermissions] = useState(['view']);
  const [generateShare] = useGenerateShareMutation();
  const [revokeShare] = useRevokeShareMutation();
  const { data: shareLinks = [], refetch } = useGetShareLinksQuery(reportId);

  const handleGenerate = async () => {
    try {
      await generateShare({
        reportId,
        expiryDays,
        permissions
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('生成分享链接失败:', error);
    }
  };

  const handleRevoke = async (token) => {
    try {
      await revokeShare(token).unwrap();
      refetch();
    } catch (error) {
      console.error('撤销分享链接失败:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(`${window.location.origin}/shared/${text}`);
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  分享报表
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      有效期(天)
                    </label>
                    <select
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="1">1天</option>
                      <option value="7">7天</option>
                      <option value="30">30天</option>
                      <option value="365">永久</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      权限
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={permissions.includes('view')}
                          onChange={(e) => 
                            setPermissions(e.target.checked 
                              ? [...permissions, 'view'] 
                              : permissions.filter(p => p !== 'view')
                            )
                          }
                          className="mr-2"
                        />
                        查看
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={permissions.includes('download')}
                          onChange={(e) => 
                            setPermissions(e.target.checked 
                              ? [...permissions, 'download'] 
                              : permissions.filter(p => p !== 'download')
                            )
                          }
                          className="mr-2"
                        />
                        下载
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none"
                  >
                    生成分享链接
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    已生成的链接
                  </h4>
                  {shareLinks.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无分享链接</p>
                  ) : (
                    <ul className="space-y-2">
                      {shareLinks.map((link) => (
                        <li key={link.token} className="flex justify-between items-center">
                          <span className="text-sm truncate max-w-xs">
                            {link.token}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyToClipboard(link.token)}
                              className="text-gray-500 hover:text-gray-700"
                              title="复制链接"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRevoke(link.token)}
                              className="text-red-500 hover:text-red-700"
                              title="撤销链接"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    关闭
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShareDialog;