import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, isOpen, title, message, onConfirm, onCancel, loading, danger }) {
  const isVisible = open || isOpen
  return (
    <Modal open={isVisible} onClose={onCancel} title={title} size="sm">
      <div className="text-sm text-neutral-600 mb-6">
        {message}
      </div>
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-200">
        <Button 
          variant="secondary" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant={danger ? 'danger' : 'primary'} 
          onClick={onConfirm} 
          loading={loading}
          disabled={loading}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
