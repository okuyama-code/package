import React, { useEffect, useState } from 'react';

export type TourDto = {
  /** ツアーID */
  tourId: number;
  /** 開始日時 */
  beginDateTime: string;
  /** 終了日時 */
  endDateTime: string;
  /** tourOperation */
  tourOperations: TourOperationDto[];
};

export type TourOperationDto = {
  /** TourOperaiton ID */
  tourOperationId: number;
  /**
   * 運行区分
   * - LOCAL (地場)
   * - REST (休憩)
   */
  operationType: 'LOCAL' | 'REST';
  /**
   * 運行
   * operationTypeが以下の場合に設定される
   * - MAIN_LINE (幹線)
   * - LOCAL (地場)
   */
  transportOperation?: number;
  /** 開始日時 */
  operationBeginDate: string;
  /** 終了日時 */
  operationEndDeate: string;
  /** 開始場所 */
  startLocation?: LocationDto;
  /** 終了場所 */
  goalLocation?: LocationDto;
  /** 車型 */
  carrierType?: '4t' | '10t';
};

type LocationDto = {
  /** 名前 */
  name: string
};

const initialRestTourOperation: TourOperationDto[] = [
  { tourOperationId: 100, operationType: 'REST',  operationBeginDate: '2024-04-19T11:00:00',
  operationEndDeate: '2024-04-19T12:00:00' },
  { tourOperationId: 101, operationType: 'REST',  operationBeginDate: '2024-04-19T11:00:00',
  operationEndDeate: '2024-04-19T12:00:00' },
  { tourOperationId: 102, operationType: 'REST',  operationBeginDate: '2024-04-19T11:00:00',
  operationEndDeate: '2024-04-19T12:00:00' },
]

const initialTours: TourDto[] = [
  {
    tourId: 1,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 1,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T08:00:00',
        operationEndDeate: '2024-04-19T12:00:00',
        carrierType: '4t',
      },
      {
        tourOperationId: 2,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T11:00:00',
        operationEndDeate: '2024-04-19T13:00:00',
        carrierType: '10t',
      },
    ],
  },
  {
    tourId: 2,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 3,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-20T14:00:00',
        operationEndDeate: '2024-04-20T16:00:00',
        carrierType: '4t',
      },
    ],
  },
  {
    tourId: 3,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 4,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-20T16:00:00',
        operationEndDeate: '2024-04-20T18:00:00',
        carrierType: '10t',
      },
    ],
  },
  {
    tourId: 4,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 5,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-20T17:00:00',
        operationEndDeate: '2024-04-20T20:00:00',
        carrierType: '4t',
      },
    ],
  },
];

const DragAndDropList: React.FC = () => {
  const [tours, setTours] = useState<TourDto[]>(initialTours);
  const [tourCount, setTourCount] = useState<number>(5);
  const [isEditMode, setIsEditMode] = useState(false);
  const [restOperations, setRestOperations] = useState<TourOperationDto[]>(initialRestTourOperation);

  useEffect(() => {
    if (!isEditMode) {
      const updatedTours = tours.filter(tour => tour.tourOperations.length > 0);
      setTours(updatedTours);
    }
  }, [isEditMode, tours]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, tourOperationId: number, isTour: boolean) => {
    event.dataTransfer.setData('tourOperationId', tourOperationId.toString());
    event.dataTransfer.setData('isTour', isTour.toString());
  };

  const handleRestOperationDrop = (tourId: number, restOperationId: number) => {
    const restOperationIndex = restOperations.findIndex(op => op.tourOperationId === restOperationId);
    if (restOperationIndex === -1) return;

    const destinationTourIndex = tours.findIndex(t => t.tourId === tourId);
    if (destinationTourIndex === -1) return;

    const updatedTours = [...tours];
    const movedRestOperation = { ...restOperations[restOperationIndex] };
    updatedTours[destinationTourIndex].tourOperations.push(movedRestOperation);
    setTours(updatedTours);

     // 元の休憩データを削除する
    const updatedRestOperations = restOperations.filter(op => op.tourOperationId !== restOperationId);
    setRestOperations(updatedRestOperations);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number) => {
    event.preventDefault();
    const tourOperationId = Number(event.dataTransfer.getData('tourOperationId'));
    const isTour = event.dataTransfer.getData('isTour') === 'true';

    if (isTour) {
      const sourceTourIndex = tours.findIndex(t => t.tourOperations.some(op => op.tourOperationId === tourOperationId));
      if (sourceTourIndex === -1) return;

      const destinationTourIndex = tours.findIndex(t => t.tourId === tourId);
      if (destinationTourIndex === -1) return;

      const updatedTours = [...tours];
      const operationIndex = updatedTours[sourceTourIndex].tourOperations.findIndex(op => op.tourOperationId === tourOperationId);
      const movedOperation = updatedTours[sourceTourIndex].tourOperations.splice(operationIndex, 1)[0];
      updatedTours[destinationTourIndex].tourOperations.push(movedOperation);
      setTours(updatedTours);
    } else {
      handleRestOperationDrop(tourId, tourOperationId);
    }
  };


  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleAddTour = (beginDateTime: string, endDateTime: string) => {
    const newTour: TourDto = {
      tourId: tourCount,
      beginDateTime,
      endDateTime,
      tourOperations: [],
    };
    setTours([...tours, newTour]);
    setTourCount(prevCount => prevCount + 1);
  };


  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}年${month}月${day}日`;
  }

  const renderTimeBlocks = () => {
    const timeBlocks = [];
    const totalMinutes = 24 * 60;
    for (let i = 0; i < 24; i++) {
      const minutesPercentage = (i * 60) / totalMinutes * 100;
      const nextMinutesPercentage = ((i + 1) * 60) / totalMinutes * 100;
      const blockWidth = `${nextMinutesPercentage - minutesPercentage}%`;
      timeBlocks.push(
        <div
          key={i}
          style={{
            flex: '0 0 auto',
            width: blockWidth,
            borderRight: '1px solid #ccc',
            padding: '5px 0',
            textAlign: 'center',
          }}
        >
          {`${i}:00`}
        </div>
      );
    }
    return timeBlocks;
  };

  const renderRestOperations = () => {
    return restOperations.map(operation => {
      const operationDuration =
        new Date(operation.operationEndDeate).getTime() -
        new Date(operation.operationBeginDate).getTime();
      const operationStartTimePercentage =
        (new Date(operation.operationBeginDate).getHours() * 60 +
          new Date(operation.operationBeginDate).getMinutes()) /
        (24 * 60) *
        100;
      const operationWidthPercentage = (operationDuration / (24 * 60 * 60 * 1000)) * 100;

      return (
        <div
          key={operation.tourOperationId}
          className="text-white rounded shadow-md overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer flex justify-center items-center mb-2"
          style={{
            backgroundColor: 'rgba(224, 118, 236, 0.8)', // 休憩の背景色
            width: `${operationWidthPercentage}%`,
          }}
          draggable={isEditMode}
          onDragStart={e => handleDragStart(e, operation.tourOperationId, false)}
        >
          <div className="text-center overflow-y-auto">
            <p>休憩</p>
            <p>
              {new Date(operation.operationBeginDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              から
            </p>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex">
        <div className="flex flex-grow">
          {/* =============== sidebar ===================== */}
          <div className="w-40 mr-5">
            sidebar
          </div>
          {/* =============== sidebar ===================== */}

          {/* ================== main ===================== */}
          <div className="flex-grow">
            <div className="bg-green-500 text-white py-4 px-6 my-2">
              <span className="mr-2">{formatDate(tours[0].beginDateTime)}</span>
            </div>
            <div className="flex justify-end mr-10 mb-4 text-white">
              <div>
                <button
                  className={`px-3 py-2 rounded-md ${isEditMode ? 'bg-red-500' : 'bg-blue-400'}`}
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? '編集を終了する' : '編集する'}
                </button>
                {isEditMode ? (
                  <button
                    className="ml-3 px-3 py-2 bg-blue-400 rounded-md"
                    onClick={() => handleAddTour(tours[0].beginDateTime, tours[0].endDateTime)}
                  >
                    ツアーを追加
                  </button>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="flex">
              <div className="w-16"></div>
              <div className="flex-grow relative h-12 flex items-center">
                {renderTimeBlocks()}
              </div>
            </div>
            {tours.map(tour => (
              <div key={tour.tourId} className="flex mb-5">
                <div className="w-16 flex items-center justify-center">
                  <span>ツアー {tour.tourId}</span>
                </div>
                <div
                  onDrop={e => handleDrop(e, tour.tourId)}
                  onDragOver={handleDragOver}
                  className="flex-grow relative h-16 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center bg-gray-100"
                >
                  {tour.tourOperations.length === 0 ? (
                    <p className="text-gray-500">編集後に空白のツアーは削除されます。</p>
                  ) : (
                    tour.tourOperations.map(operation => {
                      const operationDuration =
                        new Date(operation.operationEndDeate).getTime() - new Date(operation.operationBeginDate).getTime();
                      const operationStartTimePercentage =
                        (new Date(operation.operationBeginDate).getHours() * 60 +
                          new Date(operation.operationBeginDate).getMinutes()) /
                        (24 * 60) *
                        100;
                      const operationWidthPercentage = (operationDuration / (24 * 60 * 60 * 1000)) * 100;
                      const backgroundColor =
                        operation.operationType === 'REST'
                          ? 'rgba(224, 118, 236, 0.8)'
                          : operation.carrierType === '4t'
                          ? 'rgba(0, 123, 255, 0.8)'
                          : 'rgba(218, 136, 13, 0.8)';

                      return (
                        <div
                          key={operation.tourOperationId}
                          className="absolute text-white rounded shadow-md overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer flex justify-center items-center h-full"
                          style={{
                            left: `${operationStartTimePercentage}%`,
                            width: `${operationWidthPercentage}%`,
                            backgroundColor,
                          }}
                          draggable={isEditMode}
                          onDragStart={e => handleDragStart(e, operation.tourOperationId, true)}
                        >
                          {operation.operationType === 'REST' ? (
                            <div className="text-center overflow-y-auto">
                              <p>休憩</p>
                              <p>
                                {' '}
                                {new Date(operation.operationBeginDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                })}
                                から
                              </p>
                            </div>
                          ) : (
                            `${new Date(operation.operationBeginDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} - ${new Date(operation.operationEndDeate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* ================== main ===================== */}
        </div>
      </div>
      <div className="flex justify-center gap-x-3">
        {renderRestOperations()}
      </div>
    </>
  );
};

export default DragAndDropList;