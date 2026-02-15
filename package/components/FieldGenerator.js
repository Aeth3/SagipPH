import React from 'react';
import { TextInput, View } from 'react-native';

export default function FieldGenerator({ fieldType = 'text', ...props }) {
    // For now, only support 'text' fieldType
    return (
        <View>
            <TextInput
                testID="field-generator"
                {...props}
            />
        </View>
    );
}
