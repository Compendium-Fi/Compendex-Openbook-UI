import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
html,body{

}
input[type=number]::-webkit-inner-spin-button {
  opacity: 0;
}
input[type=number]:hover::-webkit-inner-spin-button,
input[type=number]:focus::-webkit-inner-spin-button {
  opacity: 0.25;
}
/* width */
::-webkit-scrollbar {
  width: 15px;
}
/* Track */
::-webkit-scrollbar-track {
  background: #fff;
}
/* Handle */
::-webkit-scrollbar-thumb {
  background: #5b5f67;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #5b5f67;
}
.ant-slider-track, .ant-slider:hover .ant-slider-track {
  background-color: #355DFF
  opacity: 0.75;
}
.ant-slider-track,
.ant-slider ant-slider-track:hover {
  background-color: #355DFF
  opacity: 0.75;
}
.ant-slider-dot-active,
.ant-slider-handle,
.ant-slider-handle-click-focused,
.ant-slider:hover .ant-slider-handle:not(.ant-tooltip-open)  {
  border: 2px solid #355DFF 
}
.ant-table-tbody > tr.ant-table-row:hover > td {
  background: #273043;
}
.ant-table-tbody > tr > td {
  /* border-bottom: 8px solid #1A2029; */
}
.ant-table-container table > thead > tr:first-child th {
  border-bottom: none;
}
.ant-divider-horizontal.ant-divider-with-text::before, .ant-divider-horizontal.ant-divider-with-text::after {
  border-top: 1px solid #acacad !important;
}
.ant-layout {
    // background: #11161D
  }
  .ant-table {
    background: #212734;
  }
  .ant-table-thead > tr > th {
    // background: transparent !important;
  }
.ant-select-item-option-content {
  img {
    margin-right: 4px;
  }
}
.ant-modal-content {
 
}

@-webkit-keyframes highlight {
  from { background-color:#d3b3f2}
  to {background-color: rgba(234, 228, 240,0.5);}
}
@-moz-keyframes highlight {
  from { background-color: #d3b3f2}
  to {background-color: rgba(234, 228, 240,0.5);}
}
@-keyframes highlight {
  from { background-color: #d3b3f2}
  to {background-color: rgba(234, 228, 240,0.5);}
}
.flash {
  -moz-animation: highlight 30.5s ease 0s 1 alternate ;
  -webkit-animation: highlight 30.5s ease 0s 1 alternate;
  animation: highlight 0.5s ease 0s 1 alternate;
}`;
