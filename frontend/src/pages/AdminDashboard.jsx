import { Link } from 'react-router'

const AdminDashboard = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-8">
      <div className="flex flex-col gap-2 border-b border-[#e6e8ec] pb-6">
        <p className="text-xs font-bold uppercase tracking-[.13em] text-primary-600">Administration</p>
        <h1 className="text-3xl font-bold tracking-[-.035em] text-[#182230]">Community controls</h1>
        <p className="text-sm leading-6 text-[#667085]">Keep membership and workspace preferences accurate for everyone in your community.</p>
      </div>
      <div className="card">
        <h2 className="text-lg font-bold text-[#182230]">Manage your workspace</h2>
        <p className="mt-1 text-sm text-[#667085]">Choose an area to review or update.</p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
                to="/app/admin/users"
                className="group block rounded-xl border border-[#e6e8ec] bg-[#fafbfc] p-6 transition hover:border-primary-200 hover:bg-primary-50"
            >
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">⌘</div>
                <div className="flex items-center justify-between"><h3 className="font-bold text-[#182230]">Members</h3><span className="text-[#98a2b3] transition group-hover:translate-x-0.5 group-hover:text-primary-600">→</span></div>
                <p className="mt-2 text-sm leading-6 text-[#667085]">Review access, change roles, and manage community members.</p>
            </Link>
             <Link
            to="/app/admin/settings" // Link to the new page
            className="group block rounded-xl border border-[#e6e8ec] bg-[#fafbfc] p-6 transition hover:border-primary-200 hover:bg-primary-50"
          >
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">◉</div>
            <div className="flex items-center justify-between"><h3 className="font-bold text-[#182230]">Workspace settings</h3><span className="text-[#98a2b3] transition group-hover:translate-x-0.5 group-hover:text-primary-600">→</span></div>
            <p className="mt-2 text-sm leading-6 text-[#667085]">Set issue categories and manage available analysis features.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
