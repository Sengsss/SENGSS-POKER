import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RangeGrid } from './RangeGrid';

describe('RangeGrid', () => {
  it('渲染 169 个手牌格子', () => {
    render(
      <RangeGrid
        colorMap={(hand) => ({
          bg: hand.length === 2 ? '#f87171' : '#e5e7eb',
          fg: '#000',
        })}
        legend={[{ color: '#f87171', label: '加注' }]}
      />,
    );
    expect(screen.getAllByLabelText(/./, { selector: '[data-hand]' })).toHaveLength(169);
  });

  it('高亮当前手牌', () => {
    render(
      <RangeGrid
        colorMap={() => ({ bg: '#fff', fg: '#000' })}
        highlight="AKs"
        legend={[]}
      />,
    );
    const cell = screen.getByText('AKs');
    expect(cell.className).toMatch(/ring-2/);
  });

  it('对角线是对子，右上是同花，左下是非同花', () => {
    render(
      <RangeGrid colorMap={() => ({ bg: '#fff', fg: '#000' })} legend={[]} />,
    );
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('AKs')).toBeInTheDocument();
    expect(screen.getByText('AKo')).toBeInTheDocument();
  });
});
