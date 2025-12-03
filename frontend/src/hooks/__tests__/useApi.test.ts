import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi } from '../useApi';

describe('useApi Hook', () => {
  it('should initialize with correct default values', () => {
    const mockApiFunc = jest.fn();
    const { result } = renderHook(() => useApi(mockApiFunc));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should execute API call successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunc = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useApi(mockApiFunc));

    expect(result.current.loading).toBe(false);

    let returnedData;
    await act(async () => {
      returnedData = await result.current.execute('arg1', 'arg2');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiFunc).toHaveBeenCalledWith('arg1', 'arg2');
    expect(result.current.data).toEqual(mockData);
    expect(returnedData).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle API call errors', async () => {
    const mockError = new Error('API Error');
    const mockApiFunc = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApi(mockApiFunc));

    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should set loading to true during execution', async () => {
    const mockApiFunc = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: 'test' }), 100))
    );

    const { result } = renderHook(() => useApi(mockApiFunc));

    act(() => {
      result.current.execute();
    });

    // Should be loading immediately after execute
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should reset state correctly', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunc = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useApi(mockApiFunc));

    // Execute and get data
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should return null on error', async () => {
    const mockError = new Error('API Error');
    const mockApiFunc = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApi(mockApiFunc));

    let returnedData;
    await act(async () => {
      returnedData = await result.current.execute();
    });

    expect(returnedData).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should clear error on successful execution after error', async () => {
    const mockError = new Error('API Error');
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunc = jest
      .fn()
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useApi(mockApiFunc));

    // First call - should error
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toEqual(mockError);

    // Second call - should succeed and clear error
    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockData);
    });
  });
});