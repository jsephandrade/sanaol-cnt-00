import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useVerificationQueue } from '@/hooks/useVerificationQueue';
import verificationService from '@/api/services/verificationService';
import { Badge } from '@/components/ui/badge';

const RoleSelect = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[140px]">
      <SelectValue placeholder="Select role" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="staff">Staff</SelectItem>
      <SelectItem value="manager">Manager</SelectItem>
      <SelectItem value="cashier">Cashier</SelectItem>
      <SelectItem value="admin">Admin</SelectItem>
    </SelectContent>
  </Select>
);

export const PendingVerifications = () => {
  const { requests, loading, error, approve, reject } = useVerificationQueue({
    status: 'pending',
    limit: 10,
  });
  const [previewId, setPreviewId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [actionId, setActionId] = useState(null);
  const [role, setRole] = useState('staff');
  const [note, setNote] = useState('');

  const openPreview = async (reqId) => {
    setPreviewId(reqId);
    try {
      const blob = await verificationService.fetchHeadshotBlob(reqId);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (e) {
      setPreviewUrl('');
    }
  };
  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPreviewId(null);
  };

  const onApprove = async () => {
    if (!actionId) return;
    await approve.mutateAsync({ requestId: actionId, role, note });
    setActionId(null);
    setNote('');
  };
  const onReject = async () => {
    if (!actionId) return;
    await reject.mutateAsync({ requestId: actionId, note });
    setActionId(null);
    setNote('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Verifications</CardTitle>
        <CardDescription>
          Review new account requests and assign roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-muted rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No pending requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">User</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Submitted</th>
                  <th className="py-2">Headshot</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t border-border">
                    <td className="py-2 font-medium">
                      {req.user?.name || '—'}
                    </td>
                    <td className="py-2">{req.user?.email}</td>
                    <td className="py-2">{req.user?.phone || '—'}</td>
                    <td className="py-2">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">
                      {req.hasHeadshot ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPreview(req.id)}
                        >
                          Preview
                        </Button>
                      ) : (
                        <Badge size="sm" variant="secondary">
                          No photo
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 flex gap-2 items-center">
                      <RoleSelect value={role} onChange={setRole} />
                      <Button
                        size="sm"
                        onClick={() => setActionId(req.id)}
                        disabled={approve.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActionId(req.id);
                          setNote('');
                        }}
                        disabled={reject.isPending}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Approve/Reject dialog */}
        <Dialog
          open={Boolean(actionId)}
          onOpenChange={(v) => !v && setActionId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Request</DialogTitle>
              <DialogDescription>
                Optionally add a note for the record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <RoleSelect value={role} onChange={setRole} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Note</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setActionId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onReject}
                disabled={reject.isPending}
              >
                Reject
              </Button>
              <Button onClick={onApprove} disabled={approve.isPending}>
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image preview dialog */}
        <Dialog
          open={Boolean(previewId)}
          onOpenChange={(v) => !v && closePreview()}
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Headshot Preview</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Headshot"
                  className="max-h-[60vh] rounded-md border"
                />
              ) : (
                <div className="text-sm text-muted-foreground">No image</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closePreview}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PendingVerifications;
