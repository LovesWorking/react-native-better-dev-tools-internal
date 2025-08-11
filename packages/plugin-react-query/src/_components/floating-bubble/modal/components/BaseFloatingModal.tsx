import React from 'react';
import { View, Modal, StyleSheet, Dimensions } from 'react-native';

interface BaseFloatingModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  gestureComponent?: React.ReactNode;
  modalHeight?: number;
  enableSharedModalDimensions?: boolean;
}

export function BaseFloatingModal({ 
  visible, 
  onClose, 
  children,
  header,
  footer,
  gestureComponent,
  modalHeight,
  enableSharedModalDimensions
}: BaseFloatingModalProps) {
  const { height: screenHeight } = Dimensions.get('window');
  const defaultHeight = modalHeight || screenHeight * 0.8;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { height: defaultHeight }]}>
          {gestureComponent}
          {header}
          <View style={styles.content}>
            {children}
          </View>
          {footer}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});