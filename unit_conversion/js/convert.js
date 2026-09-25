/**
 * convert.js — 변환 엔진. 입력 단위 → 목표 단위로 한 번에 가며,
 * 차원별 기준 단위를 경유하는 2단계로 계산한다 (DESIGN §3.1).
 * 인자로 받은 객체만 쓰는 순수 함수라 아무 모듈에도 의존하지 않는다.
 */
(function (global) {
  'use strict';

  /** 차원이 다른 단위끼리 변환을 시도했다는 뜻 — 코드 버그 신호 */
  function DimensionMismatchError(message) {
    this.name = 'DimensionMismatchError';
    this.message = message || '차원이 다른 단위끼리는 변환할 수 없습니다.';
    this.stack = new Error().stack;
  }
  DimensionMismatchError.prototype = Object.create(Error.prototype);
  DimensionMismatchError.prototype.constructor = DimensionMismatchError;

  /** 기존 단위 값 → 기준 단위 값 (변환 1단계) */
  function toBase(value, unit) {
    return value * unit.factor;
  }

  /** 기존 단위 → 목표 단위. 차원이 맞지 않으면 DimensionMismatchError를 던진다 */
  function toTarget(value, fromUnit, dimension, target) {
    if (!fromUnit || !dimension || !target) {
      throw new DimensionMismatchError('단위 · 차원 · 목표 단위 중 빠진 것이 있습니다.');
    }
    if (fromUnit.dimension !== dimension.id) {
      throw new DimensionMismatchError(
        '"' + fromUnit.id + '"(' + fromUnit.dimension + ')은(는) ' +
        dimension.id + ' 차원의 단위가 아닙니다.'
      );
    }
    return toBase(value, fromUnit) / target.factor;
  }

  /**
   * 입력 수량을 차원 안의 모든 단위로 환산한다. {unit, value} 배열 (F-05).
   * 기준 단위는 한 번만 구한다.
   */
  function toAllUnits(value, fromUnit, dimension) {
    if (!fromUnit || !dimension) {
      throw new DimensionMismatchError('단위 또는 차원이 빠졌습니다.');
    }
    if (fromUnit.dimension !== dimension.id) {
      throw new DimensionMismatchError(
        '"' + fromUnit.id + '"은(는) ' + dimension.id + ' 차원의 단위가 아닙니다.');
    }
    var base = toBase(value, fromUnit);
    return dimension.allUnits.map(function (unit) {
      return { unit: unit, value: base / unit.factor };
    });
  }

  global.MU = global.MU || {};
  global.MU.convert = {
    DimensionMismatchError: DimensionMismatchError,
    toTarget: toTarget,
    toAllUnits: toAllUnits
  };
})(typeof window !== 'undefined' ? window : this);
