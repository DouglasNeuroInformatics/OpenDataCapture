import React, { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { P, match } from 'ts-pattern';
import { Layout, Spinner } from './components';
import { SetupContext } from './context/SetupContext';
import * as AuthModule from './features/auth';
import * as ContactModule from './features/contact';
import * as InstrumentsModule from './features/instruments';
import * as OverviewModule from './features/overview';
import * as SetupModule from './features/setup';
import * as SubjectsModule from './features/subjects';
import * as UserModule from './features/user';
import { useAuthStore } from './stores/auth-store';
/**
 * Generates the app routes dynamically based on:
 * 1. Whether the app is setup
 * 2. Whether the user is logged in
 *
 * Changes in the auth store or setup context will trigger a rerender of this component,
 * that can serve to redirect the user (e.g., after a successful setup or login)
 */
export var Router = function () {
  var setup = useContext(SetupContext).setup;
  var isSetup = setup.isSetup;
  var accessToken = useAuthStore().accessToken;
  return React.createElement(
    BrowserRouter,
    null,
    match({ accessToken: accessToken, isSetup: isSetup })
      .with({ accessToken: P.string, isSetup: true }, function () {
        return React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(Layout, null) },
            React.createElement(Route, {
              index: true,
              element: React.createElement(OverviewModule.OverviewPage, null),
              path: 'overview'
            }),
            React.createElement(Route, {
              element: React.createElement(ContactModule.ContactPage, null),
              path: 'contact'
            }),
            React.createElement(Route, { element: React.createElement(UserModule.UserPage, null), path: 'user' }),
            React.createElement(
              Route,
              { path: 'subjects' },
              React.createElement(Route, {
                element: React.createElement(SubjectsModule.AddVisitPage, null),
                path: 'add-visit'
              }),
              React.createElement(
                Route,
                { path: 'view-subjects' },
                React.createElement(Route, {
                  index: true,
                  element: React.createElement(SubjectsModule.ViewSubjectsPage, null)
                }),
                React.createElement(
                  Route,
                  { path: ':subjectIdentifier' },
                  React.createElement(Route, {
                    index: true,
                    element: React.createElement(SubjectsModule.SelectVisualizationPage, null)
                  }),
                  React.createElement(Route, {
                    element: React.createElement(SubjectsModule.SubjectRecordsGraphPage, null),
                    path: 'graph'
                  }),
                  React.createElement(Route, {
                    element: React.createElement(SubjectsModule.SubjectRecordsTablePage, null),
                    path: 'table'
                  })
                )
              )
            ),
            React.createElement(
              Route,
              { path: 'instruments' },
              React.createElement(Route, {
                element: React.createElement(InstrumentsModule.AvailableInstrumentsPage, null),
                path: 'available'
              }),
              React.createElement(Route, {
                element: React.createElement(InstrumentsModule.ManageInstrumentsPage, null),
                path: 'manage'
              }),
              React.createElement(Route, {
                element: React.createElement(InstrumentsModule.CreateInstrumentPage, null),
                path: 'create'
              }),
              React.createElement(
                Route,
                { path: 'forms' },
                React.createElement(Route, {
                  element: React.createElement(InstrumentsModule.FormPage, null),
                  path: ':id'
                })
              )
            )
          )
        );
      })
      .with({ accessToken: P.nullish, isSetup: true }, function () {
        return React.createElement(
          Routes,
          null,
          React.createElement(Route, { element: React.createElement(AuthModule.LoginPage, null), path: 'login' }),
          React.createElement(Route, { element: React.createElement(Navigate, { to: 'login' }), path: '*' })
        );
      })
      .with({ isSetup: false }, function () {
        return React.createElement(
          Routes,
          null,
          React.createElement(Route, { element: React.createElement(SetupModule.SetupPage, null), path: 'setup' }),
          React.createElement(Route, { element: React.createElement(Navigate, { to: 'setup' }), path: '*' })
        );
      })
      .otherwise(function () {
        return React.createElement(
          'div',
          { className: 'flex h-screen items-center justify-center' },
          React.createElement(Spinner, null)
        );
      })
  );
};
