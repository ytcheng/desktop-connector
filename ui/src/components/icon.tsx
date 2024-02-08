import React from "react"

type IconProps = {
  className?: string
  fill?: string
  width: string
  height: string
}

const icons: Record<string, React.FC<IconProps>> = {
  offline: (props: IconProps) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 15C24 12.36 21.95 10.22 19.35 10.04C18.67 6.59 15.64 4 12 4C10.67 4 9.42998 4.36 8.34998 4.97L9.83998 6.46C10.51 6.17 11.23 6 12 6C15.04 6 17.5 8.46 17.5 11.5V12H19C20.66 12 22 13.34 22 15C22 15.99 21.52 16.85 20.79 17.4L22.2 18.81C23.29 17.89 24 16.54 24 15ZM3.70998 4.56C3.31998 4.95 3.31998 5.58 3.70998 5.97L5.76998 8.03H5.34998C2.06998 8.38 -0.410016 11.37 0.0599837 14.82C0.459984 17.84 3.18998 20 6.21998 20H17.73L19.02 21.29C19.41 21.68 20.04 21.68 20.43 21.29C20.82 20.9 20.82 20.27 20.43 19.88L5.11998 4.56C4.72998 4.17 4.09998 4.17 3.70998 4.56ZM5.99998 18C3.78998 18 1.99998 16.21 1.99998 14C1.99998 11.79 3.78998 10 5.99998 10H7.72998L15.73 18H5.99998Z"
        fill="currentColor"
      />
    </svg>
  ),
  compose: (props: IconProps) => (
    <svg {...props} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12059" ><path d="M950.7 571.6c3-13.7-3.5-28.3-16.6-35l-193.6-98V203.8h-0.4c2-13.1-4.5-26.6-17-33L518.7 67.3c-9-4.5-19.6-4.5-28.5 0L285.7 170.8c-6 3-10.9 7.9-14 14-3.1 6.1-4 12.7-3 19h-0.4v242.1L89.1 536.7c-6 3-10.9 7.9-14 14-3.4 6.7-4.2 14.1-2.7 21h-0.7v253.5c0 11.9 6.7 22.9 17.4 28.2l204.4 103.5c4.4 2.2 9.3 3.4 14.3 3.4s9.9-1.2 14.3-3.4L511.6 861l189.6 95.9c4.4 2.2 9.3 3.4 14.3 3.4s9.9-1.2 14.3-3.4l204.4-103.5c10.6-5.4 17.3-16.3 17.4-28.2V571.6h-0.9zM340 687.6L479.3 617v189.3L340 876.8V687.6z m337.2-247.8L536.5 511V321.7l140.7-71.2v189.3z m-203.9 69.9L331.7 438V250.5l141.6 71.7v187.5zM543.8 617l140.4 71v189.3l-140.4-71V617z m171.6 15.9l-134.4-68 134.4-68 134.3 68-134.3 68zM504.4 131l134.4 68-134.4 68-134.3-68 134.3-68zM306.1 497.8l134.3 68-132.6 67.1-134.3-68 132.6-67.1z m-171 118.6l141.6 71.7v189.3l-141.6-71.7V616.4z m612.5 260.4V687.6l140.6-71.2v189.3l-140.6 71.1z" fill="#2b7b66" p-id="12060"></path></svg>
  ),
  container: (props: IconProps) => (
    <svg {...props} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="45434" ><path d="M512.369389 511.623895c0-0.738778-181.981163-105.161686-181.981163-105.161687l181.242385 103.670699 443.750348-254.327676-181.981164-104.409476-5.211742-3.734187-443.025002 255.764935v125.296744l5.225175 2.981976 181.981163 104.422909v-0.75221l443.710051-254.273947v-125.296744L512.369389 510.132907z m0 0" fill="#2b7b66" p-id="45435"></path><path d="M330.388226 600.371278l-80.593961-46.234069L67.866831 449.714301v124.557966l181.967731 104.422908 80.593961 46.234069 181.981163 104.409476 443.669754-254.327675v-124.571399L512.369389 704.794186z m0 0" fill="#2b7b66" p-id="45436"></path><path d="M330.388226 795.032558L68.605609 644.37558v124.544534l261.782617 150.67041 181.981163 104.409476 443.710051-255.818664v-125.296744L512.369389 898.703256c0 0.738778-181.981163-103.670698-181.981163-103.670698zM69.357819 255.805231H68.605609v124.557967l181.981163 104.409476 5.211743 2.981976V363.210116L698.823517 107.391453l-5.225175-2.981977L512.369389 0z m0 0" fill="#2b7b66" p-id="45437"></path></svg>
  ),
  "chevron-down": (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  more: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  ),
  "external-link": (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  ),
  info: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  error: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  check: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  clipboard: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  ),
}

export default function Icon(props: {
  name: keyof typeof icons
  className?: string
  size: string
}) {
  const { name, size, ...rest } = props
  const Icon = icons[name]
  return <Icon {...rest} width={size} height={size} />
}

Icon.defaultProps = {
  size: "24",
}
