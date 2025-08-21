import React from 'react';

export default function RealisticAnalysisExample() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto border border-gray-200">
      {/* Compact header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-1.5 mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Legal Document Analysis</h3>
              <p className="text-blue-100 text-xs">AI Review Complete</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="bg-red-500 bg-opacity-30 text-red-100 px-2 py-0.5 rounded-full text-xs font-medium">
              2 High
            </div>
            <div className="bg-yellow-500 bg-opacity-30 text-yellow-100 px-2 py-0.5 rounded-full text-xs font-medium">
              1 Med
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Legal document preview */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 leading-relaxed border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="font-semibold text-gray-800">Договор аренды офисного помещения</span>
            </div>
            <div className="space-y-2 text-2xs">
              <p>
                <span className="font-medium text-gray-900">Пункт 4.2:</span> «Арендатор обязуется вносить арендную плату 
                <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium mx-1">
                  до 1 числа каждого месяца
                </span>
                без предварительного уведомления.»
              </p>
              <p>
                <span className="font-medium text-gray-900">Пункт 6.1:</span> «Арендодатель 
                <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium mx-1">
                  не несет ответственности за сохранность имущества
                </span>
                арендатора в помещении.»
              </p>
              <p>
                <span className="font-medium text-gray-900">Пункт 8.3:</span> «Договор может быть расторгнут арендодателем 
                <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium mx-1">
                  в одностороннем порядке с уведомлением за 10 дней
                </span>.»
              </p>
            </div>
          </div>
        </div>

        {/* Professional legal analysis */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold text-gray-800">Анализ рисков:</h4>
          
          <div className="bg-red-50 border-l-3 border-red-400 p-2 rounded-r">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-red-800 font-medium text-xs uppercase">Высокий риск</span>
            </div>
            <p className="text-red-800 text-xs leading-relaxed">
              <strong>Предоплата без гарантий.</strong> При задержке платежа на 1 день возможно расторжение договора с потерей залога.
            </p>
          </div>

          <div className="bg-red-50 border-l-3 border-red-400 p-2 rounded-r">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-red-800 font-medium text-xs uppercase">Критично</span>
            </div>
            <p className="text-red-800 text-xs leading-relaxed">
              <strong>Отказ от ответственности.</strong> При краже или порче имущества арендодатель не возместит ущерб.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-3 border-yellow-400 p-2 rounded-r">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-yellow-800 font-medium text-xs uppercase">Внимание</span>
            </div>
            <p className="text-yellow-800 text-xs leading-relaxed">
              <strong>Короткий срок уведомления.</strong> 10 дней недостаточно для поиска нового офиса и переезда.
            </p>
          </div>
        </div>

        {/* Legal summary */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium text-xs">Рекомендации</span>
          </div>
          <p className="text-blue-700 text-xs leading-relaxed">
            <strong>3 критических пункта</strong> требуют доработки. Рекомендуем увеличить срок уведомления до 30 дней и добавить страхование имущества.
          </p>
        </div>

        {/* Professional footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-gray-500">
            <svg className="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs">Проверено за 18 сек</span>
          </div>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
            Попробовать
          </button>
        </div>
      </div>
    </div>
  );
}
