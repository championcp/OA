import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BugAntIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { projectId } = useParams();
  const { user } = useSelector(state => state.auth);
  const { currentProject } = useSelector(state => state.project);

  // 全局导航项
  const globalNavigation = [
    { name: '仪表盘', href: '/', icon: HomeIcon },
    { name: '项目', href: '/projects', icon: FolderIcon },
  ];

  // 项目内导航项
  const projectNavigation = projectId ? [
    { name: '项目概览', href: `/projects/${projectId}`, icon: HomeIcon },
    { name: '看板', href: `/projects/${projectId}/kanban`, icon: ClipboardDocumentListIcon },
    { name: '文档', href: `/projects/${projectId}/documents`, icon: DocumentTextIcon },
    { name: '缺陷', href: `/projects/${projectId}/bugs`, icon: BugAntIcon },
    { name: '版本', href: `/projects/${projectId}/releases`, icon: TagIcon },
  ] : [];

  return (
    <>
      {/* 移动端侧边栏 */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">关闭侧边栏</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-xl font-bold text-primary-600">敏捷团队管理</span>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {/* 全局导航 */}
                  <div className="mb-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      全局
                    </h3>
                    {globalNavigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          `${
                            isActive
                              ? 'bg-primary-100 text-primary-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-2 py-2 text-base font-medium rounded-md`
                        }
                      >
                        <item.icon
                          className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    ))}
                  </div>

                  {/* 项目导航 */}
                  {projectId && currentProject && (
                    <div>
                      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {currentProject.name}
                      </h3>
                      {projectNavigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            `${
                              isActive
                                ? 'bg-primary-100 text-primary-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } group flex items-center px-2 py-2 text-base font-medium rounded-md`
                          }
                        >
                          <item.icon
                            className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* 强制侧边栏占用空间 */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* 桌面端侧边栏 */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-r border-gray-200">
              <span className="text-xl font-bold text-primary-600">敏捷团队管理</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto border-r border-gray-200 bg-white">
              <nav className="flex-1 px-2 py-4 space-y-4">
                {/* 全局导航 */}
                <div>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    全局
                  </h3>
                  {globalNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1`
                      }
                    >
                      <item.icon
                        className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </div>

                {/* 项目导航 */}
                {projectId && currentProject && (
                  <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {currentProject.name}
                    </h3>
                    {projectNavigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          `${
                            isActive
                              ? 'bg-primary-100 text-primary-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1`
                        }
                      >
                        <item.icon
                          className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;