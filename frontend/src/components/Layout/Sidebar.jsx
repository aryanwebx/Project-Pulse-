import { NavLink } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: "/app/dashboard", label: "Overview", icon: "overview", exact: true },
    { path: "/app/issues", label: "Issues", icon: "issues" },
  ];

  // Add Admin link for Community Admins
  if (user?.role === "community_admin") {
    navItems.push({ path: "/app/admin", label: "Community admin", icon: "settings" });
  }

  // *** NEW: Add Super Admin link for Super Admins ***
  if (user?.role === "super_admin") {
    // A super admin might also be a community admin, add both links
    // or just the super admin link which is more powerful.
    // Let's add an "Admin" link (for their own community)
    // navItems.push({ path: '/app/admin', label: 'Community Admin', icon: '⚙️' })
    // And a "Super Admin" link (for platform management)
    navItems.push({ path: "/app/superadmin", label: "Platform admin", icon: "settings" });
  }

  const NavIcon = ({ name }) => {
    const paths = {
      overview: (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
      ),
      issues: (
        <>
          <path d="M12 3a9 9 0 1 0 9 9" />
          <path d="M12 7v5l3 2" />
        </>
      ),
      settings: (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.02 1.55V20.3h-3v-.09A1.7 1.7 0 0 0 10.7 18.7a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.04 15a1.7 1.7 0 0 0-1.55-1.02H5.4v-3h.09A1.7 1.7 0 0 0 7.04 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.02-1.55V4.7h3v.09A1.7 1.7 0 0 0 15.74 6.3a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.55 1.02h.09v3h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </>
      ),
    };
    return (
      <svg
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true">
        {paths[name]}
      </svg>
    );
  };

  return (
    <aside className="flex min-h-screen w-[272px] shrink-0 flex-col border-r border-[#e6e8ec] bg-white">
      <div className="flex h-[73px] items-center gap-3 border-b border-[#e6e8ec] px-6">
        <img src="/project-pulse-mark.svg" alt="Project Pulse" className="h-9 w-9" />
        <div>
          <h2 className="text-[15px] font-bold tracking-[-.01em] text-[#182230]">Project Pulse</h2>
          <p className="text-xs text-[#667085]">Community workspace</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#98a2b3]">
          Workspace
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700 font-semibold"
                      : "font-medium text-[#475467] hover:bg-[#f7f8fa] hover:text-[#182230]"
                  }`
                }>
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border border-[#e6e8ec] bg-[#fafbfc] p-4">
          <p className="text-xs font-semibold text-[#344054]">Need to flag something?</p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">
            Submit a clear report so the right people can act quickly.
          </p>
          <NavLink
            to="/app/issues/new"
            className="mt-3 inline-flex text-xs font-bold text-primary-600 hover:text-primary-700">
            Report an issue <span className="ml-1">→</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
