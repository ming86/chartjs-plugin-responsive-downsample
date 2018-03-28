global.window = {};
import mocha = require('mocha');
import chai = require('chai');
import chai_datatime = require('chai-datetime');
chai.use(chai_datatime);
const expect = chai.expect;

import { Chart, ChartPoint } from 'chart.js';
import { DataMipmap } from '../../src/data_mipmap';

describe('DataMipMap', function () {
    let testData: ChartPoint[];
    let testDataUneven: ChartPoint[];

    function checkMipMaps(mipmaps: ChartPoint[][], startResolution: number): void {
        let resolution = startResolution;

        mipmaps.forEach((level) => {
            let lastPoint = level[0];
            for (let i = 1; i < level.length; ++i) {
                expect(new Date(level[i].x as string).getTime() - new Date(lastPoint.x as string).getTime())
                    .to.be.gte(resolution);
                lastPoint = level[i];
            }
            resolution *= 2;
        });
    }

    before(function () {
        const startTime = Date.parse("2018-01-01T12:00:00.000Z");

        testData = [];
        for (let i = 0; i < 128; ++i) {
            // 1 data point per minute
            testData.push({
                x: new Date(startTime + i * 60000).toISOString(),
                y: i
            });
        }

        let lastTimestamp = startTime;
        testDataUneven = [];
        for (let i = 0; i < 128; ++i) {
            const randomOffset = Math.floor(Math.random() * 59) + 1;
            lastTimestamp = lastTimestamp + randomOffset * 1000;

            // data points with unequal distribution over time
            testDataUneven.push({
                x: new Date(lastTimestamp).toISOString(),
                y: i
            });
        }
    });

    describe('constructor', function () {
        it('should downsample time based diagram data', function () {
            const mipMap = new DataMipmap(testData);
            const mipMapLevel = mipMap.getMipMaps();

            expect(mipMapLevel).to.have.length(7);
            checkMipMaps(mipMapLevel, 60000);
        });

        it('should downsample time based diagram data with uneven distribution', function () {
            const mipMap = new DataMipmap(testDataUneven);
            const mipMapLevel = mipMap.getMipMaps();

            checkMipMaps(mipMapLevel, 1000);
        });

        it('should downsample diagram data with mininmal number of points', function () {
            const mipMap = new DataMipmap(testData, 100);
            const mipMapLevel = mipMap.getMipMaps();

            expect(mipMapLevel).to.have.length(2);
            checkMipMaps(mipMapLevel, 60000);
        });

        it('should handle an empty dataset', function () {
            const mipMap = new DataMipmap([]);
            const mipMapLevel = mipMap.getMipMaps();

            expect(mipMapLevel).to.have.length(1);
        });
    });

    describe('setData', function () {
        it('should update mip map level', function () {
            const mipMap = new DataMipmap(testData);
            let mipMapLevel = mipMap.getMipMaps();
            expect(mipMapLevel).to.have.length(7);

            mipMap.setData(testDataUneven);
            expect(mipMap.getMipMaps()).to.not.equal(mipMapLevel);

            mipMapLevel = mipMapLevel = mipMap.getMipMaps();
            checkMipMaps(mipMapLevel, 1000);
        });
    });

    describe('setMinNumPoints', function () {
        it('should update min num points', function () {
            const mipMap = new DataMipmap(testData);
            let mipMapLevel = mipMap.getMipMaps();
            expect(mipMapLevel).to.have.length(7);

            mipMap.setMinNumPoints(100);
            expect(mipMap.getMipMaps()).to.not.equal(mipMapLevel);
            mipMapLevel = mipMapLevel = mipMap.getMipMaps();
            expect(mipMapLevel).to.have.length(2);
            checkMipMaps(mipMapLevel, 1000);
        });
    });

    describe('getMipMapForResolution', function () {
        it('should return first level if resolution is null', function () {
            const mipMap = new DataMipmap(testData);
            const mipMapLevel = mipMap.getMipMaps();

            expect(mipMap.getMipMapForResolution(null)).to.equal(mipMapLevel[0]);
        });

        it('should return a level best fitting for desired resolution', function () {
            const mipMap = new DataMipmap(testData);
            const mipMapLevel = mipMap.getMipMaps();

            expect(mipMap.getMipMapForResolution(1)).to.equal(mipMapLevel[0]);
            expect(mipMap.getMipMapForResolution(60000)).to.equal(mipMapLevel[0]);
            expect(mipMap.getMipMapForResolution(100000)).to.equal(mipMapLevel[0]);
            expect(mipMap.getMipMapForResolution(120000)).to.equal(mipMapLevel[1]);
            expect(mipMap.getMipMapForResolution(480000)).to.equal(mipMapLevel[3]);
            expect(mipMap.getMipMapForResolution(10000000)).to.equal(mipMapLevel[6]);
            expect(mipMap.getMipMapForResolution(10000000000)).to.equal(mipMapLevel[6]);
        });

        it('should return an empty level for empty dataset', function () {
            const mipMap = new DataMipmap([]);
            const mipMapLevel = mipMap.getMipMaps();

            expect(mipMap.getMipMapForResolution(1)).to.equal(mipMapLevel[0]);
            expect(mipMap.getMipMapForResolution(60000)).to.equal(mipMapLevel[0]);
            expect(mipMap.getMipMapForResolution(100000)).to.equal(mipMapLevel[0]);
            expect(mipMap.getMipMapForResolution(120000)).to.equal(mipMapLevel[0]);
        });
    });
});
