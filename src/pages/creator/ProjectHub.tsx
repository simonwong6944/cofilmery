/**
 * ProjectHub — 已整合至 CreatorWorks (/creator/works)
 * 路由 /creator/projects → redirect 去 /creator/works
 * (option b: 保留路由但 redirect，避免舊連結 404)
 */
import { Navigate } from 'react-router-dom';

export default function ProjectHub() {
  return <Navigate to="/creator/works" replace />;
}
