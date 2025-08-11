import { useState, useCallback } from "react";
import { Mutation, Query, QueryKey } from "@tanstack/react-query";
// Temporarily disable persistence to isolate issues
// import { useModalPersistence } from "./useModalPersistence";
// import { devToolsStorageKeys } from "../_shared/storage/devToolsStorageKeys";

/**
 * Custom hook for managing modal states and related query selection
 * Simplified version without persistence for testing
 */
export function useModalManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isSentryModalOpen, setIsSentryModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [selectedQueryKey, setSelectedQueryKey] = useState<
    QueryKey | undefined
  >(undefined);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isStateRestored] = useState(true); // Set to true since we're not using persistence
  const [activeTab, setActiveTab] = useState<
    "queries" | "mutations"
  >("queries");
  const [selectedMutationId, setSelectedMutationId] = useState<
    number | undefined
  >(undefined);

  const handleModalDismiss = () => {
    setIsModalOpen(false);
    setSelectedQueryKey(undefined);
    // Note: Keep activeFilter when dismissing - user might want to maintain filter on next open
  };

  const handleDebugModalDismiss = () => {
    setIsDebugModalOpen(false);
    setSelectedSection(null);
  };

  const handleQuerySelect = (query: Query | undefined) => {
    setSelectedQueryKey(query?.queryKey);
  };

  const handleQueryPress = () => {
    setIsModalOpen(true);
  };

  const handleStatusPress = () => {
    setIsDebugModalOpen(true);
  };

  const handleEnvPress = () => {
    setIsEnvModalOpen(true);
  };

  const handleSentryPress = () => {
    setIsSentryModalOpen(true);
  };

  const handleStoragePress = () => {
    setIsStorageModalOpen(true);
  };

  const handleEnvModalDismiss = () => {
    setIsEnvModalOpen(false);
  };

  const handleSentryModalDismiss = () => {
    setIsSentryModalOpen(false);
  };

  const handleStorageModalDismiss = () => {
    setIsStorageModalOpen(false);
  };

  const handleMutationSelect = (mutation: Mutation | undefined) => {
    setSelectedMutationId(mutation?.mutationId);
  };

  const handleTabChange = (newTab: "queries" | "mutations") => {
    if (newTab !== activeTab) {
      setSelectedQueryKey(undefined);
      setSelectedMutationId(undefined);
      // Reset query status filters when switching tabs (they don't apply to storage)
      setActiveFilter(null);
    }
    setActiveTab(newTab);
  };

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const setCurrentRoute = useCallback((route: "browser" | "editor") => {
    // Map route to activeTab for compatibility
    if (route === "browser") {
      setActiveTab("queries");
    }
  }, []);

  const setDetailView = useCallback((view: any) => {
    if (view?.queryKey) {
      setSelectedQueryKey(view.queryKey);
    } else if (view?.mutationId) {
      setSelectedMutationId(view.mutationId);
    }
  }, []);

  return {
    isModalOpen,
    isDebugModalOpen,
    isEnvModalOpen,
    isSentryModalOpen,
    isStorageModalOpen,
    selectedQueryKey,
    selectedSection,
    activeFilter,
    isStateRestored,
    activeTab,
    selectedMutationId,
    setSelectedSection,
    setActiveFilter,
    setActiveTab,
    handleModalDismiss,
    handleDebugModalDismiss,
    handleEnvModalDismiss,
    handleSentryModalDismiss,
    handleStorageModalDismiss,
    handleQuerySelect,
    handleQueryPress,
    handleStatusPress,
    handleEnvPress,
    handleSentryPress,
    handleStoragePress,
    handleTabChange,
    handleMutationSelect,
    // For compatibility with tests
    openModal,
    closeModal,
    currentRoute: activeTab === "queries" ? "browser" : "editor",
    setCurrentRoute,
    detailView: selectedQueryKey ? { queryKey: selectedQueryKey } : selectedMutationId ? { mutationId: selectedMutationId } : null,
    setDetailView,
  };
}
