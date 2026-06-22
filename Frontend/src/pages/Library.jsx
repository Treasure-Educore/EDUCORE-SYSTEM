import { useState } from "react";
import DataTable from "../components/DataTable";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { deleteLibraryItem, getNextBookId, libraryStatusOptions, loadLibraryItems, upsertLibraryItem } from "../data/library";

const emptyDraft = {
  id: "",
  title: "",
  category: "",
  copies: "",
  issued: "",
  status: "Available",
};

export default function Library() {
  const [books, setBooks] = useState(() => loadLibraryItems());
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});

  const columns = [
    { key: "id", label: "Book ID", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "copies", label: "Copies", sortable: true },
    { key: "issued", label: "Issued", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  function refresh(nextBooks = loadLibraryItems()) {
    setBooks(nextBooks);
  }

  function openEditor(book = null) {
    setSelected(book);
    setDraft({
      id: book?.id || getNextBookId(),
      title: book?.title || "",
      category: book?.category || "",
      copies: book?.copies ?? "",
      issued: book?.issued ?? "",
      status: book?.status || "Available",
    });
    setErrors({});
    setEditorOpen(true);
  }

  function validate(nextDraft) {
    const nextErrors = {};
    const copies = Number(nextDraft.copies);
    const issued = Number(nextDraft.issued);
    if (!nextDraft.id.trim()) nextErrors.id = "Book ID is required.";
    if (!nextDraft.title.trim()) nextErrors.title = "Book title is required.";
    if (!nextDraft.category.trim()) nextErrors.category = "Category is required.";
    if (nextDraft.copies === "" || !Number.isFinite(copies) || copies < 0) nextErrors.copies = "Enter a valid copy count.";
    if (nextDraft.issued === "" || !Number.isFinite(issued) || issued < 0) nextErrors.issued = "Enter a valid issued count.";
    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      upsertLibraryItem(draft, selected);
      refresh();
      setEditorOpen(false);
      setSelected(null);
      setDraft(emptyDraft);
    } catch (error) {
      setErrors({ form: error.message || "Unable to save book." });
    }
  }

  function handleDelete(book) {
    if (!window.confirm("Delete this book record?")) {
      return;
    }

    refresh(deleteLibraryItem(book.id));
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Library"
        subtitle="Catalog books, issue records, and availability at a glance."
        action={
          <button type="button" className="primary-button" onClick={() => openEditor(null)}>
            Add Book
          </button>
        }
      />
      <DataTable
        title="Library Catalog"
        description="Responsive inventory view with actions and sorting."
        columns={columns}
        data={books}
        searchPlaceholder="Search books..."
        onEdit={(row) => openEditor(row)}
        onDelete={(row) => handleDelete(row)}
      />

      <Modal
        open={editorOpen}
        title={selected ? `Edit ${selected.title}` : "Add Book"}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={() => setEditorOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleSave}>
              Save Book
            </button>
          </div>
        }
      >
        {errors.form ? <div className="staff-form__notice staff-form__notice--error">{errors.form}</div> : null}
        <div className="form-grid">
          <FormInput label="Book ID" value={draft.id} onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))} error={errors.id} />
          <FormInput label="Title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} error={errors.title} />
          <FormInput label="Category" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} error={errors.category} />
          <FormInput label="Copies" type="number" min="0" value={draft.copies} onChange={(event) => setDraft((current) => ({ ...current, copies: event.target.value }))} error={errors.copies} />
          <FormInput label="Issued" type="number" min="0" value={draft.issued} onChange={(event) => setDraft((current) => ({ ...current, issued: event.target.value }))} error={errors.issued} />
          <label className="form-field">
            <span className="form-field__label">Status</span>
            <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
              {libraryStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}
