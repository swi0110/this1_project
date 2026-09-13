/**
 * convert.js — 변환 엔진 (순수 함수)
 *
 * 변환 방향은 단방향이다: 기존 단위 → 메르헨 단위.
 * 모든 변환은 차원별 기준 단위를 경유하는 2단계로 처리한다. (DESIGN §3.1)
 *
 * 의존: MU.units
 */
(function (global) {
  'use strict';

  /** 차원이 다른 단위끼리 변환을 시도했을 때 던지는 오류 (코드 버그 신호) */
  function DimensionMismatchError(message) {
    this.name = 'DimensionMismatchError';
    this.message = message || '차원이 다른 단위끼리는 변환할 수 없습니다.';
    this.stack = new Error().stack;
  }
  DimensionMismatchError.prototype = Object.create(Error.prototype);
  DimensionMismatchError.prototype.constructor = DimensionMismatchError;

  /**
   * 기존 단위 값 → 기준 단위 값
   * @param {number} value
   * @param {Object} unit
   * @returns {number}
   */
  function toBase(value, unit) {
    return value * unit.factor;
  }

  /**
   * 기존 단위 → 해당 차원의 메르헨 단위로 변환
   * @param {number} value      입력값
   * @param {Object} fromUnit   입력 단위 (기존 단위)
   * @param {Object} dimension  대상 차원
   * @returns {number} 메르헨 단위 값
   * @throws {DimensionMismatchError} fromUnit이 dimension 소속이 아닐 때
   */
  function toMarchen(value, fromUnit, dimension) {
    if (!fromUnit || !dimension) {
      throw new DimensionMismatchError('단위 또는 차원이 지정되지 않았습니다.');
    }
    if (fromUnit.dimension !== dimension.id) {
      throw new DimensionMismatchError(
        '"' + fromUnit.id + '"(' + fromUnit.dimension + ')은(는) ' +
        dimension.label + ' 차원의 단위가 아닙니다.'
      );
    }
    return toBase(value, fromUnit) / dimension.target.factor;
  }

  /**
   * 같은 숫자를 차원 내 모든 기존 단위로 해석했을 때의 메르헨 값 (F-05)
   * @param {number} value
   * @param {Object} dimension
   * @returns {Array<{unit: Object, value: number}>}
   */
  function toMarchenAll(value, dimension) {
    return dimension.sources.map(function (unit) {
      return { unit: unit, value: toMarchen(value, unit, dimension) };
    });
  }

  global.MU = global.MU || {};
  global.MU.convert = {
    DimensionMismatchError: DimensionMismatchError,
    toBase: toBase,
    toMarchen: toMarchen,
    toMarchenAll: toMarchenAll
  };
})(typeof window !== 'undefined' ? window : this);
