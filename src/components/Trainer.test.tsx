import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Trainer } from './Trainer';
import { rfiModule } from '../modules/rfiModule';

describe('Trainer（RFI 全链路）', () => {
  it('发牌 -> 选择动作 -> 显示判分与范围表 -> 下一手', () => {
    render(<Trainer module={rfiModule} strictMode={false} />);

    // 场景与牌面已渲染
    expect(screen.getByText(/轮到你率先行动/)).toBeInTheDocument();

    // 点击 Fold（RFI 场景都允许 fold），应立即出现判分结果
    fireEvent.click(screen.getByRole('button', { name: /Fold/ }));
    expect(screen.getByText(/✓ 正确|✗ 错误/)).toBeInTheDocument();

    // 判分后应显示完整范围表（169 格）与下一手按钮
    expect(document.querySelectorAll('[data-hand]')).toHaveLength(169);
    expect(screen.getByRole('button', { name: /下一手/ })).toBeInTheDocument();

    // 点击下一手，答题按钮重新出现，判分结果消失
    fireEvent.click(screen.getByRole('button', { name: /下一手/ }));
    expect(screen.getByRole('button', { name: /Fold/ })).toBeInTheDocument();
    expect(screen.queryByText(/✓ 正确|✗ 错误/)).not.toBeInTheDocument();
  });

  it('答题后再次点击动作按钮不会重复判分（结果区已替换为范围表）', () => {
    render(<Trainer module={rfiModule} strictMode={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Raise/ }));
    // 动作按钮应已被结果区替换，不能重复点击
    expect(screen.queryByRole('button', { name: /^Raise/ })).not.toBeInTheDocument();
  });

  it('strictMode 下显示 GTO 频率信息', () => {
    render(<Trainer module={rfiModule} strictMode={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Fold/ }));
    expect(screen.getByText(/你的选择 GTO 频率/)).toBeInTheDocument();
  });
});
