import PropTypes from 'prop-types';
import React, { useState } from 'react';
// import { Circle, G, Rect, Text, Line } from 'react-native-svg';
import { Dimensions, View } from 'react-native';

import * as theme from '../core/theme'
import { CustomIcon } from '.';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const screenWidth = Dimensions.get('window').width;

const Tooltip = null
// const Tooltip = ({ x, y, textX, textY, stroke, pointStroke, position, dismiss }) => {
    
//     let tipW = 50 + textY.length*5,
//         tipH = 36,
//         tipX = 5,
//         tipY = -9,
//         tipTxtX = 12,
//         tipTxtY = 6;
//     const posY = y;
//     const posX = x;

//     if (posX > screenWidth - tipW) {
//         tipX = -(tipX + tipW);
//         tipTxtX = tipTxtX - tipW - 6;
//     }

//     const boxPosX = position === 'left' ? posX - tipW - screenWidth * 0.03 : posX;

//     const x1 = tipX + 1 + tipW - 9
//     const y1 = tipY - 1 + 3
//     const x2 = tipX + 1 + tipW - 2
//     const y2 = tipY - 1 + 10


//     return (
//         <G>
//             <Circle
//                 cx={posX}
//                 cy={posY}
//                 r={4}
//                 stroke={pointStroke}
//                 strokeWidth={1}
//                 fill={'green'}
//             />
//             <G x={boxPosX < 40 ? 40 : boxPosX} y={posY} >
//                 <Rect
//                     x={tipX + 1}
//                     y={tipY - 1}
//                     width={tipW}
//                     height={tipH - 2}
//                     fill={'rgba(255, 255, 255, 0.9)'}
//                     rx={3}
//                     ry={3}
//                     opacity={0.85}
//                     onPress={dismiss}
//                 />

//                 <Text
//                     x={tipTxtX}
//                     y={tipTxtY}
//                     fontSize="12"
//                     stroke={theme.colors.secondary}
//                     textAnchor="start">
//                     {textY} €
//                 </Text>

//                 <Line onPress={dismiss} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.colors.gray_dark} strokeWidth="1" />
//                 <Line onPress={dismiss} x1={x1} y1={y2} x2={x2} y2={y1} stroke={theme.colors.gray_dark} strokeWidth="1" />
//             </G>
//         </G>

//     );
// };

// Tooltip.propTypes = {
//     x: PropTypes.func.isRequired,
//     y: PropTypes.func.isRequired,
//     height: PropTypes.number,
//     stroke: PropTypes.string,
//     pointStroke: PropTypes.string,
//     textX: PropTypes.string,
//     textY: PropTypes.string,
//     position: PropTypes.string,
// };

// Tooltip.defaultProps = {
//     position: 'right',
// };

export default Tooltip