import {
    ActionSheetIOS,
    Alert,
    Platform,
  } from 'react-native';
  
  type PocketActions = {
    onEdit: () => void;
    onAdjust: () => void;
    onDelete: () => void;
  };
  
  export function showPocketActions({
    onEdit,
    onAdjust,
    onDelete,
  }: PocketActions) {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            'Cancel',
            'Edit Pocket',
            'Adjust Budget',
            'Delete Pocket',
          ],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        buttonIndex => {
          if (buttonIndex === 1) onEdit();
          if (buttonIndex === 2) onAdjust();
          if (buttonIndex === 3) {
            Alert.alert(
              'Delete pocket?',
              'This will remove the pocket and its data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: onDelete,
                },
              ]
            );
          }
        }
      );
    } else {
      Alert.alert(
        'Pocket actions',
        undefined,
        [
          { text: 'Edit Pocket', onPress: onEdit },
          {
            text: 'Adjust Budget',
            onPress: onAdjust,
          },
          {
            text: 'Delete Pocket',
            style: 'destructive',
            onPress: onDelete,
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  }
  