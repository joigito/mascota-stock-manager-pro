import React, { useMemo, useState } from 'react';
import { useVariantAttributes, VariantAttributeDef } from '@/hooks/useVariantAttributes';

type Props = {
  organizationId?: string;
  open: boolean;
  onClose: () => void;
};

export default function VariantAttributeManager({ organizationId, open, onClose }: Props) {
  const { attributes, loading, load, add, update, remove } = useVariantAttributes(organizationId);
  const [editing, setEditing] = useState<VariantAttributeDef | null>(null);
  const [form, setForm] = useState({ name: '', key: '', data_type: 'string', options: '', position: 0 });

  React.useEffect(() => {
    if (!open) {
      setEditing(null);
      setForm({ name: '', key: '', data_type: 'string', options: '', position: 0 });
    }
  }, [open]);

  React.useEffect(() => {
    console.debug('VariantAttributeManager: open=', open, 'organizationId=', organizationId);
  }, [open, organizationId]);

  const startEdit = (a: VariantAttributeDef) => {
    setEditing(a);
    setForm({
      name: a.name,
      key: a.key,
      data_type: a.data_type,
      options: a.options ? JSON.stringify(a.options) : '',
      position: a.position || 0,
    });
  };

  const commit = async () => {
    try {
      const payload: any = {
        name: form.name,
        key: form.key,
        data_type: form.data_type,
        options: form.options ? JSON.parse(form.options) : null,
        position: Number(form.position) || 0,
      };
      if (editing) {
        await update(editing.id, payload);
      } else {
        await add(payload);
      }
      setEditing(null);
      setForm({ name: '', key: '', data_type: 'string', options: '', position: 0 });
    } catch (err) {
      console.error('commit attribute', err);
      alert('Error saving attribute');
    }
  };

  const doDelete = async (id: string) => {
    if (!confirm('Delete attribute?')) return;
    try {
      await remove(id);
    } catch (err) {
      console.error('delete attribute', err);
      alert('Error deleting attribute');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-card rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Variant attribute definitions</h3>
          <div>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium">Attributes</h4>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <ul className="space-y-2 mt-2">
              {attributes.map((a) => (
                <li key={a.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{a.name} <span className="text-sm text-gray-500">({a.key})</span></div>
                    <div className="text-sm text-gray-600">{a.data_type}{a.options ? ` — options: ${JSON.stringify(a.options)}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 text-sm bg-blue-500 text-white rounded" onClick={() => startEdit(a)}>Edit</button>
                    <button className="px-2 py-1 text-sm bg-red-500 text-white rounded" onClick={() => doDelete(a.id)}>Delete</button>
                  </div>
                </li>
              ))}
              {attributes.length === 0 && <li className="text-sm text-gray-600">No attributes defined for this organization.</li>}
            </ul>
          )}
          <div className="mt-2">
            <button className="px-3 py-1 bg-gray-100 rounded mr-2" onClick={() => { console.debug('Reload attributes'); void load(); }}>Reload</button>
            <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => { console.debug('Attributes:', attributes); alert(`Loaded ${attributes.length} attributes (check console)`); }}>Debug</button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">{editing ? 'Edit attribute' : 'Add attribute'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Key (slug)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
            <select className="border p-2 rounded" value={form.data_type} onChange={(e) => setForm({ ...form, data_type: e.target.value })}>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="enum">Enum</option>
            </select>
            <input className="border p-2 rounded" placeholder='Options (JSON array for enum) e.g. ["S","M","L"]' value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
            <input className="border p-2 rounded col-span-2" placeholder="Position (integer)" value={String(form.position)} onChange={(e) => setForm({ ...form, position: Number(e.target.value || 0) })} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={commit}>{editing ? 'Save' : 'Create'}</button>
            {editing && <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setEditing(null); setForm({ name: '', key: '', data_type: 'string', options: '', position: 0 }); }}>Cancel</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
