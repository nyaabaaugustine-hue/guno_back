export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-dark-900">Settings</h1>
        <p className="text-dark-500 text-sm mt-1">Manage your account and firm settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First name</label>
                <input type="text" className="input" defaultValue="Jane" />
              </div>
              <div>
                <label className="label">Last name</label>
                <input type="text" className="input" defaultValue="Doe" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" defaultValue="jane@firm.com" />
            </div>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Firm</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Firm name</label>
              <input type="text" className="input" defaultValue="Doe & Associates" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" className="input" defaultValue="(555) 000-0000" />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input" rows={2} defaultValue="123 Main St, Suite 100" />
            </div>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>

        <div className="card p-6 border-red-200">
          <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-dark-500 mb-4">Permanently delete your account and all associated data.</p>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  )
}
