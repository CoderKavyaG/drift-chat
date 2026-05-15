import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ControlBar } from '../components/ControlBar';
import React from 'react';

// Mock Lucide icons as they are complex SVGs
vi.mock('lucide-react', () => ({
  Mic: () => <div data-testid="mic-icon" />,
  MicOff: () => <div data-testid="mic-off-icon" />,
  Video: () => <div data-testid="video-icon" />,
  VideoOff: () => <div data-testid="video-off-icon" />,
  MonitorUp: () => <div data-testid="monitor-icon" />,
  MessageSquare: () => <div data-testid="chat-icon" />,
  SkipForward: () => <div data-testid="skip-icon" />,
  Flag: () => <div data-testid="flag-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  PhoneOff: () => <div data-testid="hangup-icon" />,
}));

describe('ControlBar Component', () => {
  it('renders all control buttons', () => {
    render(<ControlBar />);
    
    expect(screen.getByLabelText(/mute|unmute/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/camera/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/share screen|stop sharing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/chat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next stranger/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/report/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hang up/i)).toBeInTheDocument();
  });

  it('shows unread count badge when greater than zero', () => {
    render(<ControlBar unreadCount={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows "9+" for unread count greater than 9', () => {
    render(<ControlBar unreadCount={12} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('toggles mic icon based on isMuted prop', () => {
    const { rerender } = render(<ControlBar isMuted={false} />);
    expect(screen.getByTestId('mic-icon')).toBeInTheDocument();

    rerender(<ControlBar isMuted={true} />);
    expect(screen.getByTestId('mic-off-icon')).toBeInTheDocument();
  });

  it('calls onToggleMute when mic button is clicked', () => {
    const onToggleMute = vi.fn();
    render(<ControlBar isMuted={false} onToggleMute={onToggleMute} />);
    
    fireEvent.click(screen.getByLabelText('Mute'));
    expect(onToggleMute).toHaveBeenCalledTimes(1);
  });

  it('calls onHangup when hang up button is clicked', () => {
    const onHangup = vi.fn();
    render(<ControlBar onHangup={onHangup} />);
    
    fireEvent.click(screen.getByLabelText('Hang up'));
    expect(onHangup).toHaveBeenCalledTimes(1);
  });
});
