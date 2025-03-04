
import * as React from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';

const NewsItem = ({ title, uri, overview, onPress, style, ...props }) => {
    console.log('uri', uri)
    return (
        <Card onPress= {onPress} style={style}>
            <Card.Cover source={{ uri: uri }} />
            <Card.Content>
                <Title>{title}</Title>
                {/* <Paragraph>{overview}</Paragraph> */}
            </Card.Content>
        </Card>
    )

}

export default NewsItem