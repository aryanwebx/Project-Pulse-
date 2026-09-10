import { useEffect, useState } from "react";

const IssueDetails = ({ issue, isAdmin, categories, onCategoryChange }) => {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategory, setDraftCategory] = useState(issue.category);

  useEffect(() => {
    setDraftCategory(issue.category);
  }, [issue.category]);

  const saveCategory = async () => {
    if (draftCategory === issue.category) {
      setIsEditingCategory(false);
      return;
    }

    await onCategoryChange(draftCategory);
    setIsEditingCategory(false);
  };

  const cancelCategoryEdit = () => {
    setDraftCategory(issue.category);
    setIsEditingCategory(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h3>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Category:</span>
                {isAdmin && isEditingCategory ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <select
                      value={draftCategory}
                      onChange={(event) => setDraftCategory(event.target.value)}
                      className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 font-medium text-gray-900">
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={saveCategory}
                      className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelCategoryEdit}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{issue.category}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCategory(true)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700">
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm text-gray-600">Location:</span>
                <div className="font-medium text-gray-900">{issue.location}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Reported:</span>
                <div className="font-medium text-gray-900">{formatDate(issue.createdAt)}</div>
              </div>
              {issue.updatedAt !== issue.createdAt && (
                <div>
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <div className="font-medium text-gray-900">{formatDate(issue.updatedAt)}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Status Information</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Current Status:</span>
                <div className="font-medium text-gray-900 capitalize">
                  {issue.status.replace("-", " ")}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Priority:</span>
                <div className="font-medium text-gray-900 capitalize">{issue.urgency}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Upvotes:</span>
                <div className="font-medium text-gray-900">{issue.upvoteCount}</div>
              </div>
              {issue.assignedTo && (
                <div>
                  <span className="text-sm text-gray-600">Assigned To:</span>
                  <div className="font-medium text-gray-900">{issue.assignedTo.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
