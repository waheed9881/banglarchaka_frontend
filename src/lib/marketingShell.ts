/** Premium light header + landing shell (mega menus preserved). */
export function isMarketingShellPath(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return false;
  if (pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')) return false;
  if (pathname.startsWith('/dealer/portal')) return false;

  if (pathname === '/') return true;
  const exact = ['/used-bikes', '/used-cars/sell', '/used-car-dealers', '/compare'];
  if (exact.includes(pathname)) return true;
  if (pathname === '/new-cars') return true;
  return false;
}
