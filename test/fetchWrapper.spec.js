"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const undici_1 = require("undici");
const Fetch_1 = require("../src/worker/Fetch");
const originalFetch = async (resource, init) => {
    return new undici_1.Response();
};
const sleep = (ms) => new Promise(res => setTimeout(res, ms));
describe('Fetch Wrapped for scenes', () => {
    const log = jest.fn();
    const logPreview = jest.fn();
    const wrappedProductionFetch = (0, Fetch_1.createFetch)({
        canUseFetch: true,
        log,
        originalFetch,
        previewMode: false
    });
    const wrappedPreviewFetch = (0, Fetch_1.createFetch)({
        canUseFetch: true,
        log: logPreview,
        originalFetch,
        previewMode: true
    });
    const wrappedNotAllowedFetch = (0, Fetch_1.createFetch)({
        canUseFetch: false,
        log,
        originalFetch,
        previewMode: false
    });
    const timePerFetchSleep = 100;
    const wrappedDelayFetch = (0, Fetch_1.createFetch)({
        canUseFetch: true,
        log,
        originalFetch: (async (_resource, init) => {
            await sleep(timePerFetchSleep);
            if (init.signal?.aborted) {
                const a = new Error('Abort');
                a.name = 'AbortError';
                throw a;
            }
            return new undici_1.Response('Done', init);
        }),
        previewMode: true
    });
    // *
    // * Deployed mode test
    // *
    it('should run successfully if the url is secure in deployed scenes', async () => {
        await wrappedProductionFetch('https://decentraland.org');
    });
    it('should throw an error if the url is not secure in deployed scenes', async () => {
        await expect(async () => {
            await wrappedProductionFetch('http://decentraland.org');
        }).rejects.toThrow();
    });
    // *
    // * Preview mode test
    // *
    it('should run successfully if the url is secure in preview scenes', async () => {
        await wrappedPreviewFetch('https://decentraland.org');
    });
    it('should log an error if the url is not secure in preview scenes', async () => {
        expect(logPreview).not.toHaveBeenCalled();
        await wrappedPreviewFetch('http://decentraland.org');
        expect(logPreview).toHaveBeenCalled();
    });
    // *
    // * Not allowed fetchs mode test
    // *
    it('should throw an error because it does not have permissions', async () => {
        await expect(async () => {
            await wrappedNotAllowedFetch('https://decentraland.org');
        }).rejects.toThrow();
    });
    it('should execute only one fetch at the same time', async () => {
        let counter = 0;
        const N = 10;
        for (let i = 0; i < N; i++) {
            wrappedDelayFetch('https://test.test/').then(() => counter++);
        }
        await sleep(timePerFetchSleep * 1.2);
        expect(counter).toEqual(1);
        await sleep(timePerFetchSleep * 2);
        expect(counter).toEqual(3);
    });
    it('should abort fetch if reaches the timeout opt 1', async () => {
        await expect(wrappedDelayFetch('https://test.test/', { timeout: 10 })).rejects.toThrow('AbortError');
    });
    it('should abort fetch if reaches the timeout opt 2', async () => {
        let counter = 0;
        await expect(Promise.all([
            wrappedDelayFetch('https://test.test/', { timeout: 5 }).catch((err) => {
                counter++;
            }),
            wrappedDelayFetch('https://test.test/', {}).then(() => counter++)
        ])).rejects.toThrow('AbortError');
        expect(counter).toEqual(2);
    });
});
