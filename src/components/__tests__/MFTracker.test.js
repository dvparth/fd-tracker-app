import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the adapters so the component does not perform network calls
jest.mock('../../adapters/mfAdapters', () => ({
    availableAdapters: ['mock'],
    fetchSchemeDataUsingAdapter: jest.fn((key, scheme) => {
        // Provide deterministic sample data for two schemes
        return Promise.resolve({
            entries: [
                { date: '01-10-2025', nav: '12.34' },
                { date: '30-09-2025', nav: '12.00' },
                { date: '31-08-2025', nav: '11.50' }
            ],
            meta: { scheme_name: `Mock ${scheme.scheme_code}` }
        });
    })
}));

import MFTracker from '../MFTracker';
// Provide a small fixture for schemes metadata used in tests
const schemes = [
    { scheme_code: 147946, principal: 109454, unit: 2346.73 },
    { scheme_code: 118269, principal: 38748, unit: 621.802 }
];
// import the mocked function to assert call counts
const { fetchSchemeDataUsingAdapter } = require('../../adapters/mfAdapters');

describe('MFTracker', () => {
    test('renders summary and scheme list after load', async () => {
        // Mock global fetch for /schemes and /user/holdings endpoints
        const originalFetch = global.fetch;
        global.fetch = jest.fn((input, opts) => {
            if (typeof input === 'string' && input.endsWith('/schemes')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ schemes }) });
            }
            if (typeof input === 'string' && input.endsWith('/user/holdings')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ holdings: schemes.map(s => ({ scheme_code: s.scheme_code, principal: s.principal, unit: s.unit })) }) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });

        render(<MFTracker darkMode={false} setDarkMode={() => { }} />);

        // loader should show initially
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        // wait for the data to load and the SummaryCard to appear
        await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

        // Summary header (owner name) should be present
        expect(screen.getByText(/Parth Dave/i)).toBeInTheDocument();

        // Assert adapter was called once per configured scheme
        expect(fetchSchemeDataUsingAdapter).toHaveBeenCalledTimes(schemes.length);

        // Summary header (owner name) should be present
        expect(screen.getByText(/Parth Dave/i)).toBeInTheDocument();

        // Refresh button toggles load again (smoke test) - the button has label 'Refresh'
        const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
        userEvent.click(refreshBtn);

        // After clicking refresh, progress indicator may appear; ensure it resolves
        await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

        // restore fetch
        global.fetch = originalFetch;
    });
});
