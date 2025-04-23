
import * as React from 'react';
import { Card, Text, Paragraph } from 'react-native-paper';
import * as theme from '../core/theme'

const NewsItem = ({ title, uri, overview, onPress, style, ...props }) => {

    //  title = title.replaceAll('&rsquo;', "'")
    title = title.replace(/&rsquo;/g, "'");
    title = title.replace(/&#8217;/g, "'");

    return (
        <Card onPress={onPress} style={[style,{backgroundColor:'#fff'}]}>
            <Card.Cover source={{ uri }} />
            <Card.Content >
                <Text style={[theme.customFontMSregular.body, { paddingTop: theme.padding, color:'#000' }]}>{title}</Text>
                <Paragraph style={{color:"#000"}}>{overview}</Paragraph>
            </Card.Content>
        </Card>
    )

}

export default NewsItem